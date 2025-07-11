import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
import { CourseFilter } from "../type";

export async function createCourse(data: any) {
  try {
    const formattedData = {
      ...data,
      application_start_date: new Date(data.application_start_date),
      application_end_date: new Date(data.application_end_date),
      course_start_date: new Date(data.course_start_date),
      course_end_date: new Date(data.course_end_date),
      reference_link: data.reference_link || "",
    };

    const course = await prisma.course.create({
      data: formattedData,
    });

    return course;
  } catch (error) {
    console.error("Error creating course:", error);
    throw error;
  }
}

export async function getCourses(filter?: CourseFilter) {
  try {
    const where: Prisma.CourseWhereInput = {};

    if (filter?.name) {
      where.name = { contains: filter.name, mode: "insensitive" };
    }

    if (filter?.organised_by) {
      where.organised_by = {
        contains: filter.organised_by,
        mode: "insensitive",
      };
    }

    const courses = await prisma.course.findMany({
      where,
      orderBy: { created_at: "desc" },
    });

    return courses;
  } catch (error) {
    console.error("Error fetching courses:", error);
    throw error;
  }
}

export async function getCourseById(id: string) {
  try {
    const course = await prisma.course.findUnique({
      where: { id },
    });

    if (!course) {
      throw new Error(`Course with ID ${id} not found`);
    }

    return course;
  } catch (error) {
    console.error(`Error fetching course with ID ${id}:`, error);
    throw error;
  }
}

export async function updateCourse(id: string, data: any) {
  try {
    const updatedCourse = await prisma.course.update({
      where: { id },
      data: data,
    });

    return updatedCourse;
  } catch (error) {
    console.error(`Error updating course with ID ${id}:`, error);
    throw error;
  }
}

export async function deleteCourse(id: string) {
  try {
    const course = await prisma.course.delete({
      where: { id },
    });

    return course;
  } catch (error) {
    console.error(`Error deleting course with ID ${id}:`, error);
    throw error;
  }
}
