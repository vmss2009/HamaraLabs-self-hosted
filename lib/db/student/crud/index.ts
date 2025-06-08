import { prisma } from "@/lib/db/prisma";
import { StudentCreateInput, StudentFilter } from "../type";

export async function createStudent(data: StudentCreateInput) {
  try {
    const student = await prisma.student.create({
      data: {
        first_name: data.first_name,
        last_name: data.last_name,
        aspiration: data.aspiration,
        gender: data.gender,
        email: data.email,
        class: data.class,
        section: data.section,
        comments: data.comments,
        school_id: data.schoolId
      }
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
    
    if (filter?.school_id) {
      where.school_id = filter.school_id;
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

export async function getStudentById(id: number) {
  try {
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        school: true
      }
    });
    
    return student;
  } catch (error) {
    console.error(`Error fetching student with id ${id}:`, error);
    throw error;
  }
}

export async function updateStudent(id: number, data: StudentCreateInput) {
  try {
    const student = await prisma.student.update({
      where: { id },
      data: {
        first_name: data.first_name,
        last_name: data.last_name,
        aspiration: data.aspiration,
        gender: data.gender,
        email: data.email,
        class: data.class,
        section: data.section,
        comments: data.comments,
        school_id: data.schoolId
      },
      include: {
        school: true
      }
    });
    
    return student;
  } catch (error) {
    console.error(`Error updating student with id ${id}:`, error);
    throw error;
  }
}

export async function deleteStudent(id: number) {
  try {
    await prisma.student.delete({
      where: { id }
    });
  } catch (error) {
    console.error(`Error deleting student with id ${id}:`, error);
    throw error;
  }
} 