import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";
import { StudentCreateInput, StudentFilter } from "../type";
import { v4 as uuidv4 } from "uuid";

export async function createStudent(data: StudentCreateInput) {
  try {
    const validatedData = data;
    let userId: string | undefined = undefined;

    // Create a User record if email is provided
    if (validatedData.email && validatedData.email.trim() !== "") {
      console.log(`Creating/updating user for student email: ${validatedData.email}, school: ${validatedData.schoolId}`);
      
      // Check if user with this email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: validatedData.email },
      });

      if (existingUser) {
        console.log(`Found existing user: ${existingUser.id}, current schools: ${existingUser.schools}`);
        // Add school to existing user's schools array if not already present
        const updatedSchools = existingUser.schools.includes(validatedData.schoolId) 
          ? existingUser.schools 
          : [...existingUser.schools, validatedData.schoolId];
          
        console.log(`Updated schools array for student: ${updatedSchools}`);
          
        // Update existing user with student information
        const updatedUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            first_name: validatedData.first_name,
            last_name: validatedData.last_name,
            schools: updatedSchools,
            user_meta_data: {},
          },
        });
        userId = updatedUser.id;
      } else {
        console.log(`Creating new user for student email: ${validatedData.email}`);
        // Create new user
        const newUser = await prisma.user.create({
          data: {
            id: uuidv4(),
            email: validatedData.email,
            first_name: validatedData.first_name,
            last_name: validatedData.last_name,
            schools: [validatedData.schoolId],
            user_meta_data: {},
          },
        });
        console.log(`Created new user: ${newUser.id} with schools: ${newUser.schools}`);
        userId = newUser.id;
      }
    }

    const student = await prisma.student.create({
      data: {
        first_name: validatedData.first_name,
        last_name: validatedData.last_name,
        aspiration: validatedData.aspiration,
        gender: validatedData.gender,
        email: validatedData.email,
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

    // Handle User record updates
    if (validatedData.email && validatedData.email.trim() !== "") {
      if (currentStudent.user_id) {
        // Add new school to existing user's schools array if not already present
        const currentSchools = currentStudent.user?.schools || [];
        const updatedSchools = currentSchools.includes(validatedData.schoolId) 
          ? currentSchools 
          : [...currentSchools, validatedData.schoolId];
          
        // Update existing linked user
        await prisma.user.update({
          where: { id: currentStudent.user_id },
          data: {
            email: validatedData.email,
            first_name: validatedData.first_name,
            last_name: validatedData.last_name,
            schools: updatedSchools,
            user_meta_data: {},
          },
        });
      } else {
        // Check if user with new email already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: validatedData.email },
        });

        if (existingUser) {
          // Add school to existing user's schools array if not already present
          const updatedSchools = existingUser.schools.includes(validatedData.schoolId) 
            ? existingUser.schools 
            : [...existingUser.schools, validatedData.schoolId];
            
          // Link to existing user and update their info
          const updatedUser = await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              first_name: validatedData.first_name,
              last_name: validatedData.last_name,
              schools: updatedSchools,
              user_meta_data: {},
            },
          });
          userId = updatedUser.id;
        } else {
          // Create new user
          const newUser = await prisma.user.create({
            data: {
              id: uuidv4(),
              email: validatedData.email,
              first_name: validatedData.first_name,
              last_name: validatedData.last_name,
              schools: [validatedData.schoolId],
              user_meta_data: {},
            },
          });
          userId = newUser.id;
        }
      }
    } else if (currentStudent.user_id) {
      // Email was removed - we could either keep the user or unlink
      // For now, let's unlink but keep the user record
      userId = undefined;
    }

    const updatedStudent = await prisma.student.update({
      where: { id },
      data: {
        first_name: validatedData.first_name,
        last_name: validatedData.last_name,
        aspiration: validatedData.aspiration,
        gender: validatedData.gender,
        email: validatedData.email,
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

    // Delete the student
    await prisma.student.delete({
      where: { id },
    });

    // Optional: If the user was created specifically for this student
    // and has no other roles/relationships, you might want to delete the user too
    // For now, we'll keep the user record but could add logic here to clean up
    // orphaned user records if needed
    
  } catch (error) {
    console.error(`Error deleting student with id ${id}:`, error);
    throw error;
  }
}
