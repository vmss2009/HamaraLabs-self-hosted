import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";
import { StudentCreateInput, StudentFilter } from "../type";
import { createUser, updateUser, deleteUser } from "@/lib/db/auth/user";
import { ensureEmailsAvailable, normalizeEmail } from "@/lib/db/shared/email";

type StudentRole = 'STUDENT';

async function cleanupOrphanedUser(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { students: true, mentors: true, school_visits: true },
    });

    if (!user) return;

    if (
      user.schools.length === 0 &&
      user.students.length === 0 &&
      user.mentors.length === 0 &&
      user.school_visits.length === 0
    ) {
      await deleteUser(userId);
    }
  } catch (error) {
    console.error(`Error cleaning up user ${userId}:`, error);
  }
}

function addRoleForSchool(meta: any, schoolId: string, role: StudentRole) {
  const currentMeta = (meta ?? {}) as Record<string, any>;
  const rolesBySchool: Record<string, string[] | string> = {
    ...(currentMeta.rolesBySchool ?? {}),
  };
  const existing = rolesBySchool[schoolId];
  let updatedForSchool: string[];
  if (!existing) {
    updatedForSchool = [role];
  } else if (Array.isArray(existing)) {
    updatedForSchool = Array.from(new Set([...existing, role]));
  } else {
    updatedForSchool = Array.from(new Set([existing, role]));
  }
  rolesBySchool[schoolId] = updatedForSchool;
  return { ...currentMeta, rolesBySchool };
}

function removeRoleForSchool(meta: any, schoolId: string, role: StudentRole) {
  const currentMeta = (meta ?? {}) as Record<string, any>;
  const rolesBySchool: Record<string, string[] | string> = {
    ...(currentMeta.rolesBySchool ?? {}),
  };
  const existing = rolesBySchool[schoolId];
  if (!existing) return currentMeta;
  const arr = Array.isArray(existing) ? existing : [existing];
  const filtered = arr.filter((r) => String(r).toUpperCase() !== role);
  if (filtered.length === 0) {
    delete rolesBySchool[schoolId];
  } else {
    rolesBySchool[schoolId] = filtered;
  }
  return { ...currentMeta, rolesBySchool };
}

async function ensureUserForStudent(
  email: string,
  first_name: string,
  last_name: string,
  schoolId: string
) {
  const sanitizedEmail = email.trim();
  const existingUser = await prisma.user.findUnique({ where: { email: sanitizedEmail } });
  if (existingUser) {
    const updatedSchools = existingUser.schools.includes(schoolId)
      ? existingUser.schools
      : [...existingUser.schools, schoolId];
    const newMeta = addRoleForSchool(existingUser.user_meta_data, schoolId, 'STUDENT');
    const updated = await updateUser(existingUser.id, {
      first_name,
      last_name,
      schools: updatedSchools,
      user_meta_data: newMeta,
    });
    return updated.id;
  } else {
    const created = await createUser({
      email: sanitizedEmail,
      first_name,
      last_name,
      schools: [schoolId],
      user_meta_data: addRoleForSchool({}, schoolId, 'STUDENT'),
    });
    return created.id;
  }
}

async function removeStudentAccessFromUser(userId: string, schoolId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;
  const updatedSchools = user.schools.filter((s) => s !== schoolId);
  const newMeta = removeRoleForSchool(user.user_meta_data, schoolId, 'STUDENT');
  await updateUser(userId, { schools: updatedSchools, user_meta_data: newMeta });
  await cleanupOrphanedUser(userId);
}

export async function createStudent(data: StudentCreateInput) {
  try {
    const validatedData = data;
  const sanitizedEmail = validatedData.email?.trim() || undefined;

    if (sanitizedEmail) {
      await ensureEmailsAvailable([sanitizedEmail]);
    }

    let userId: string | undefined = undefined;

    // Create or link a User if email is provided, and grant STUDENT role for the school
    if (sanitizedEmail) {
      userId = await ensureUserForStudent(
        sanitizedEmail,
        validatedData.first_name,
        validatedData.last_name,
        validatedData.schoolId
      );
    }

    const student = await prisma.student.create({
      data: {
        first_name: validatedData.first_name,
        last_name: validatedData.last_name,
        aspiration: validatedData.aspiration,
        gender: validatedData.gender,
  email: sanitizedEmail ?? null,
        class: validatedData.class,
        section: validatedData.section,
        comments: validatedData.comments,
        school_id: validatedData.schoolId,
        user_id: userId,
      },
      include: {
        user: true,
        school: true,
      },
    });

    return student;
  } catch (error) {
    console.error("Error creating student:", error);
    throw error;
  }
}

export async function getStudents(filter?: StudentFilter) {
  try {
    const where: Prisma.StudentWhereInput = {};

    if (filter?.first_name) {
      where.first_name = { contains: filter.first_name, mode: "insensitive" };
    }

    if (filter?.last_name) {
      where.last_name = { contains: filter.last_name, mode: "insensitive" };
    }

    if (filter?.gender) {
      where.gender = filter.gender;
    }

    if (filter?.class) {
      where.class = filter.class;
    }

    if (filter?.section) {
      where.section = filter.section;
    }

    if (filter?.schoolId) {
      where.school_id = filter.schoolId;
    }

    const students = await prisma.student.findMany({
      where,
      include: {
        user: true,
        school: {
          select: {
            id: true,
            name: true,
            is_ATL: true,
          },
        },
      },
    });

    return students;
  } catch (error) {
    console.error("Error fetching students:", error);
    throw error;
  }
}

export async function getStudentById(id: string) {
  try {
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        user: true,
        school: true,
      },
    });

    return student;
  } catch (error) {
    console.error(`Error fetching student with id ${id}:`, error);
    throw error;
  }
}

export async function updateStudent(id: string, data: StudentCreateInput) {
  try {
    const validatedData = data;

    // Get current student to check if they have a user_id
    const currentStudent = await prisma.student.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!currentStudent) {
      throw new Error("Student not found");
    }

    let userId: string | undefined = currentStudent.user_id || undefined;

    const oldEmail = currentStudent.email?.trim() || undefined;
    const newEmail = validatedData.email?.trim() || undefined;
    const oldSchoolId = currentStudent.school_id;
    const newSchoolId = validatedData.schoolId;

    const emailChanged = normalizeEmail(newEmail) !== normalizeEmail(oldEmail);

    if (emailChanged && newEmail) {
      await ensureEmailsAvailable([newEmail], oldEmail ? [oldEmail] : []);
    }

    // Track old user for potential cleanup after student update
    let oldUserIdForCleanup: string | undefined = undefined;

    // Case 1: email changed
    if (emailChanged) {
      // Remove access from old user if present and then delete the old user
      if (currentStudent.user_id) {
        await removeStudentAccessFromUser(currentStudent.user_id, oldSchoolId);
        // Defer cleanup until after student points to new user
        oldUserIdForCleanup = currentStudent.user_id;
      }

      // Link/create new user for new email (if provided)
      if (newEmail) {
        userId = await ensureUserForStudent(
          newEmail,
          validatedData.first_name,
          validatedData.last_name,
          newSchoolId
        );
      } else {
        userId = undefined;
      }
    } else {
      // Email unchanged
      if (currentStudent.user_id) {
        // If school changed, move role association from old school to new school
        if (oldSchoolId !== newSchoolId) {
          // Remove from old school
          await removeStudentAccessFromUser(currentStudent.user_id, oldSchoolId);
          // Add to new school
          userId = await ensureUserForStudent(
            currentStudent.user!.email,
            validatedData.first_name,
            validatedData.last_name,
            newSchoolId
          );
        } else {
          // Just update user's name if needed and ensure role present
          await ensureUserForStudent(
            currentStudent.user!.email,
            validatedData.first_name,
            validatedData.last_name,
            newSchoolId
          );
        }
      } else if (newEmail) {
        // No linked user previously but now we have an email
        userId = await ensureUserForStudent(
          newEmail,
          validatedData.first_name,
          validatedData.last_name,
          newSchoolId
        );
      }
    }

    const updatedStudent = await prisma.student.update({
      where: { id },
      data: {
        first_name: validatedData.first_name,
        last_name: validatedData.last_name,
        aspiration: validatedData.aspiration,
        gender: validatedData.gender,
        email: newEmail ?? null,
        class: validatedData.class,
        section: validatedData.section,
        comments: validatedData.comments,
        school_id: validatedData.schoolId,
        user_id: userId,
      },
      include: {
        user: true,
        school: true,
      },
    });

    // Now that student points to the new user, safely cleanup the old user if any
    if (oldUserIdForCleanup) {
      await cleanupOrphanedUser(oldUserIdForCleanup);
    }

    return updatedStudent;
  } catch (error) {
    console.error(`Error updating student with id ${id}:`, error);
    throw error;
  }
}

export async function deleteStudent(id: string) {
  try {
    // Get student info before deletion to check if they have a linked user
    const student = await prisma.student.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!student) {
      throw new Error("Student not found");
    }

    // Remove student access from user if present
    if (student.user_id) {
      const userId = student.user_id;
      // Remove per-school role and association first
      await removeStudentAccessFromUser(userId, student.school_id);

      // Detach any other optional relations that could block deletion
      await prisma.mentor.updateMany({ where: { user_id: userId }, data: { user_id: null } });
      await prisma.schoolVisit.updateMany({ where: { poc_id: userId }, data: { poc_id: null } });
    }

    // Delete the student
    await prisma.student.delete({ where: { id } });
    
    // Attempt safe cleanup of user AFTER student deletion (only if no associations)
    if (student.user_id) {
      await cleanupOrphanedUser(student.user_id);
    }
    
  } catch (error) {
    console.error(`Error deleting student with id ${id}:`, error);
    throw error;
  }
}
