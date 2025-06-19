import { prisma } from "@/lib/db/prisma";
import { StudentFilter } from "../type";

export async function createStudent(data: any) {
  try {
    const validatedData = data;

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
    const where: any = {};
    
    if (filter?.first_name) {
      where.first_name = { contains: filter.first_name, mode: 'insensitive' };
    }
    
    if (filter?.last_name) {
      where.last_name = { contains: filter.last_name, mode: 'insensitive' };
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
    
    if (filter?.userSchoolIds) {
      where.school_id = { in: filter.userSchoolIds };
    } else if (filter?.schoolId) {
      where.school_id = filter.schoolId;
    }
    
    const students = await prisma.student.findMany({
      where,
      include: {
        school: {
          select: {
            id: true,
            name: true,
            is_ATL: true,
          }
        }
      }
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
        school: true,
      },
    });

    return student;
  } catch (error) {
    console.error(`Error fetching student with id ${id}:`, error);
    throw error;
  }
}

export async function updateStudent(id: string, data: any) {
  try {
    const validatedData = data;

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
      },
      include: {
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
    await prisma.student.delete({
      where: { id }
    });
  } catch (error) {
    console.error(`Error deleting student with id ${id}:`, error);
    throw error;
  }
} 