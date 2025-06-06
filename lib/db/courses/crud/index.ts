import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
import { CourseFilter } from "../type";

import { courseSchema } from "../type";

export async function createCourse(data: any) {
  try {
    const result = courseSchema.safeParse(data);

    if (!result.success) {
      const errorMessages = result.error.errors.map(
        (err) => `${err.path.join(".")}: ${err.message}`
      );
      console.error("Validation failed:", errorMessages);
      throw new Error(errorMessages[0]);
    }

    const { id, ...sanitizedData } = result.data as any;

    const formattedData = {
      ...sanitizedData,
      application_start_date: new Date(sanitizedData.application_start_date),
      application_end_date: new Date(sanitizedData.application_end_date),
      course_start_date: new Date(sanitizedData.course_start_date),
      course_end_date: new Date(sanitizedData.course_end_date),
      reference_link: sanitizedData.reference_link || "",
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

    if (filter?.organized_by) {
      where.organized_by = {
        contains: filter.organized_by,
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

export async function getCourseById(id: number) {
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

export async function updateCourse(id: number, data: any) {
  try {
    const result = courseSchema.safeParse(data);

    if (!result.success) {
      const errorMessages = result.error.errors.map(
        (err) => `${err.path.join(".")}: ${err.message}`
      );
      console.error("Validation failed:", errorMessages);
      throw new Error(errorMessages[0]);
    }

    const validatedData = result.data;

    const updatedCourse = await prisma.course.update({
      where: { id },
      data: validatedData,
    });

    return updatedCourse;
  } catch (error) {
    console.error(`Error updating course with ID ${id}:`, error);
    throw error;
  }
}

export async function deleteCourse(id: number) {
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
