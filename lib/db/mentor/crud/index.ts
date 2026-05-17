import { prisma } from "@/lib/db/prisma";
import { MentorCreateInput, MentorFilter, MentorUpdateInput, MentorWithUser } from "../type";
import { Prisma } from "@prisma/client";
import { createUser, updateUser, deleteUser } from "@/lib/db/auth/user";
import { ensureEmailsAvailable, normalizeEmail } from "@/lib/db/shared/email";

type MentorRole = 'MENTOR';

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

function addMentorRoleForSchools(meta: any, schoolIds: string[]) {
  const currentMeta = (meta ?? {}) as Record<string, any>;
  const rolesBySchool: Record<string, string[] | string> = {
    ...(currentMeta.rolesBySchool ?? {}),
  };
  for (const sid of schoolIds) {
    const existing = rolesBySchool[sid];
    if (!existing) {
      rolesBySchool[sid] = ['MENTOR'];
    } else if (Array.isArray(existing)) {
      if (!existing.map((x) => String(x).toUpperCase()).includes('MENTOR')) {
        rolesBySchool[sid] = Array.from(new Set([...existing, 'MENTOR']));
      }
    } else if (String(existing).toUpperCase() !== 'MENTOR') {
      rolesBySchool[sid] = [existing, 'MENTOR'];
    }
  }
  return { ...currentMeta, rolesBySchool };
}

function removeMentorRoleForSchools(meta: any, schoolIds: string[]) {
  const currentMeta = (meta ?? {}) as Record<string, any>;
  const rolesBySchool: Record<string, string[] | string> = {
    ...(currentMeta.rolesBySchool ?? {}),
  };
  for (const sid of schoolIds) {
    const existing = rolesBySchool[sid];
    if (!existing) continue;
    const arr = Array.isArray(existing) ? existing : [existing];
    const filtered = arr.filter((r) => String(r).toUpperCase() !== 'MENTOR');
    if (filtered.length === 0) delete rolesBySchool[sid];
    else rolesBySchool[sid] = filtered;
  }
  return { ...currentMeta, rolesBySchool };
}

async function removeMentorAccessFromUser(userId: string, schoolIds: string[]) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;
  const newMeta = removeMentorRoleForSchools(user.user_meta_data, schoolIds);
  const rb = (newMeta.rolesBySchool ?? {}) as Record<string, any>;
  const keepSchools = new Set(Object.keys(rb));
  const updatedSchools = user.schools.filter((sid) => keepSchools.has(sid));
  await updateUser(userId, { schools: updatedSchools, user_meta_data: newMeta });
  await cleanupOrphanedUser(userId);
}

async function createOrUpdateMentorUser(mentorData: MentorCreateInput, schoolIds: string[]) {
  const sanitizedEmail = mentorData.email?.trim();

  if (!sanitizedEmail) {
    // No email provided, no user account needed
    return undefined;
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: sanitizedEmail },
  });

  if (existingUser) {
    // Add schools to existing user's schools array if not already present
    const updatedSchools = [...new Set([...existingUser.schools, ...schoolIds])];
    const newMeta = addMentorRoleForSchools(existingUser.user_meta_data, schoolIds);
    return await updateUser(existingUser.id, {
      first_name: mentorData.first_name,
      last_name: mentorData.last_name,
      schools: updatedSchools,
      user_meta_data: { ...newMeta, phone_number: mentorData.phone_number },
    });
  } else {
    const meta = addMentorRoleForSchools({}, schoolIds);
    return await createUser({
      email: sanitizedEmail,
      first_name: mentorData.first_name,
      last_name: mentorData.last_name,
      schools: schoolIds,
      user_meta_data: { ...meta, phone_number: mentorData.phone_number },
    });
  }
}

export async function createMentor(data: MentorCreateInput): Promise<MentorWithUser> {
  try {
    const sanitizedEmail = data.email?.trim() || undefined;

    if (sanitizedEmail) {
      await ensureEmailsAvailable([sanitizedEmail]);
    }

    const mentorInput: MentorCreateInput = {
      ...data,
      email: sanitizedEmail,
    };

    let userId: string | undefined = undefined;

    // Create or update user if email is provided
    if (sanitizedEmail) {
      const user = await createOrUpdateMentorUser(mentorInput, data.school_ids);
      userId = user?.id;
    }

    const mentor = await prisma.mentor.create({
      data: {
        first_name: data.first_name,
        last_name: data.last_name,
        email: sanitizedEmail ?? null,
        phone_number: data.phone_number,
        school_ids: data.school_ids,
        comments: data.comments,
        user_id: userId,
      },
      include: {
        user: true,
      },
    });

    return mentor;
  } catch (error) {
    console.error("Error creating mentor:", error);
    throw error;
  }
}

export async function getMentors(filter?: MentorFilter): Promise<MentorWithUser[]> {
  try {
    const where: Prisma.MentorWhereInput = {
      ...(filter?.name && {
        OR: [
          { first_name: { contains: filter.name, mode: Prisma.QueryMode.insensitive } },
          { last_name: { contains: filter.name, mode: Prisma.QueryMode.insensitive } }
        ]
      }),
      ...(filter?.email && { email: { contains: filter.email, mode: Prisma.QueryMode.insensitive } }),
      ...(filter?.schoolId && {
        school_ids: {
          has: filter.schoolId
        }
      })
    };

    const mentors = await prisma.mentor.findMany({
      where,
      include: {
        user: true,
      },
      orderBy: {
        first_name: "asc",
      },
    });

    return mentors;
  } catch (error) {
    console.error("Error fetching mentors:", error);
    throw error;
  }
}

export async function getMentorById(id: string): Promise<MentorWithUser | null> {
  try {
    const mentor = await prisma.mentor.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    return mentor;
  } catch (error) {
    console.error("Error fetching mentor:", error);
    throw error;
  }
}

export async function updateMentor(id: string, data: MentorUpdateInput): Promise<MentorWithUser> {
  try {
    // Get current mentor to check if they have a user_id
    const currentMentor = await prisma.mentor.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!currentMentor) {
      throw new Error("Mentor not found");
    }

    let userId: string | undefined = currentMentor.user_id || undefined;

    const oldEmail = currentMentor.email?.trim() || undefined;
    const emailProvided = data.email !== undefined;
    const newEmail = emailProvided ? (data.email?.trim() || undefined) : oldEmail;
    const newSchoolIds = data.school_ids ?? currentMentor.school_ids;

    const emailChanged = normalizeEmail(newEmail) !== normalizeEmail(oldEmail);

    if (emailProvided && emailChanged && newEmail) {
      await ensureEmailsAvailable([newEmail], oldEmail ? [oldEmail] : []);
    }

    // Track old user for potential cleanup after mentor update
    let oldUserIdForCleanup: string | undefined = undefined;

    // Handle email change scenarios
    if (emailChanged) {
      if (newEmail) {
        // Collect old user's schools for transfer
        const oldUser = currentMentor.user_id
          ? await prisma.user.findUnique({ where: { id: currentMentor.user_id } })
          : null;
        const oldUserSchools = oldUser?.schools ?? [];

        // Find or create the new user by newEmail
        const existingNewUser = await prisma.user.findUnique({ where: { email: newEmail } });
        const combinedSchools = [...new Set([...(existingNewUser?.schools ?? []), ...oldUserSchools, ...newSchoolIds])];

        let newUserId: string;
        if (existingNewUser) {
          const updated = await updateUser(existingNewUser.id, {
            first_name: data.first_name || currentMentor.first_name,
            last_name: data.last_name || currentMentor.last_name,
            schools: combinedSchools,
            user_meta_data: addMentorRoleForSchools({
              ...((existingNewUser.user_meta_data ?? {}) as Record<string, any>),
              phone_number: data.phone_number,
            }, newSchoolIds),
          });
          newUserId = updated.id;
        } else {
          const created = await createUser({
            email: newEmail,
            first_name: data.first_name || currentMentor.first_name,
            last_name: data.last_name || currentMentor.last_name,
            schools: combinedSchools,
            user_meta_data: addMentorRoleForSchools({ phone_number: data.phone_number }, newSchoolIds),
          });
          newUserId = created.id;
        }

        // Migrate POC references from old user to new user
        if (currentMentor.user_id) {
          await prisma.schoolVisit.updateMany({
            where: { poc_id: currentMentor.user_id },
            data: { poc_id: newUserId },
          });
          // Remove mentor access/roles from old user for current mentor schools
          await removeMentorAccessFromUser(currentMentor.user_id, currentMentor.school_ids);
        }

        userId = newUserId;

        // Defer cleanup of previous user until after mentor is updated to point to new user
        if (currentMentor.user_id) {
          oldUserIdForCleanup = currentMentor.user_id;
        }
      } else {
        // Email removed; detach existing user if any
        if (currentMentor.user_id) {
          await prisma.schoolVisit.updateMany({
            where: { poc_id: currentMentor.user_id },
            data: { poc_id: null },
          });
          await removeMentorAccessFromUser(currentMentor.user_id, currentMentor.school_ids);
          oldUserIdForCleanup = currentMentor.user_id;
        }
        userId = undefined;
      }
    } else if (newEmail) {
      // Email unchanged; update existing or link/create if missing
      if (currentMentor.user_id) {
        const currentSchools = currentMentor.user?.schools || [];
        const merged = [...new Set([...currentSchools, ...newSchoolIds])];
        await updateUser(currentMentor.user_id, {
          first_name: data.first_name || currentMentor.first_name,
          last_name: data.last_name || currentMentor.last_name,
          schools: merged,
          user_meta_data: addMentorRoleForSchools({
            ...(((currentMentor.user?.user_meta_data ?? {}) as Record<string, any>)),
            phone_number: data.phone_number,
          }, newSchoolIds),
        });
      } else if (emailProvided) {
        // No linked user previously but now we have an email
        const existing = await prisma.user.findUnique({ where: { email: newEmail } });
        if (existing) {
          const merged = [...new Set([...existing.schools, ...newSchoolIds])];
          await updateUser(existing.id, {
            first_name: data.first_name || currentMentor.first_name,
            last_name: data.last_name || currentMentor.last_name,
            schools: merged,
            user_meta_data: addMentorRoleForSchools({
              ...((existing.user_meta_data ?? {}) as Record<string, any>),
              phone_number: data.phone_number,
            }, newSchoolIds),
          });
          userId = existing.id;
        } else {
          const created = await createUser({
            email: newEmail,
            first_name: data.first_name || currentMentor.first_name,
            last_name: data.last_name || currentMentor.last_name,
            schools: newSchoolIds,
            user_meta_data: addMentorRoleForSchools({ phone_number: data.phone_number }, newSchoolIds),
          });
          userId = created.id;
        }
      }
    }

    const updatedMentor = await prisma.mentor.update({
      where: { id },
      data: {
        first_name: data.first_name || currentMentor.first_name,
        last_name: data.last_name || currentMentor.last_name,
        email: data.email === undefined ? undefined : (newEmail ?? null),
        phone_number: data.phone_number,
        school_ids: data.school_ids || currentMentor.school_ids,
        comments: data.comments,
        user_id: userId,
      },
      include: {
        user: true,
      },
    });

    // Now that mentor points to the new user, safely cleanup the old user if any
    if (oldUserIdForCleanup) {
      await cleanupOrphanedUser(oldUserIdForCleanup);
    }

    return updatedMentor;
  } catch (error) {
    console.error(`Error updating mentor with id ${id}:`, error);
    throw error;
  }
}

export async function deleteMentor(id: string) {
  try {
    // Get mentor info before deletion to check if they have a linked user
    const mentor = await prisma.mentor.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!mentor) {
      throw new Error("Mentor not found");
    }

    // Remove mentor's access/role and null POC references first
    if (mentor.user_id) {
      await removeMentorAccessFromUser(mentor.user_id, mentor.school_ids);
      await prisma.schoolVisit.updateMany({ where: { poc_id: mentor.user_id }, data: { poc_id: null } });
    }

    // Delete the mentor record
    await prisma.mentor.delete({ where: { id } });

    // Attempt safe cleanup (delete only if no associations) AFTER mentor deletion
    if (mentor.user_id) {
      await cleanupOrphanedUser(mentor.user_id);
    }

    return true;
  } catch (error) {
    console.error(`Error deleting mentor with id ${id}:`, error);
    throw error;
  }
}
