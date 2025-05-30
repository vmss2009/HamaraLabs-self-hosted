// lib/db/course/crud.ts
import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
import { CourseCreateInput, CourseUpdateInput, CourseFilter } from "../type";

import { z } from "zod";



export const courseSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().min(1, "Description is required"),
  organized_by: z.string().trim().min(1, "Organized by is required"),
  application_start_date: z.coerce.date(),
  application_end_date: z.coerce.date(),
  course_start_date: z.coerce.date(),
  course_end_date: z.coerce.date(),
  eligibility_from: z.string().trim().min(1, "Eligibility from is required"),
  eligibility_to: z.string().trim().min(1, "Eligibility to is required"),
 reference_link: z.string().trim().url("Reference link must be a valid URL").optional().or(z.literal("")),
 requirements: z.array(
  z.string()
    .transform(val => val.trim())
    .refine(val => val.length > 0, { message: "Requirement cannot be empty or spaces only" })
),
course_tags: z.array(
  z.string()
    .transform(val => val.trim())
    .refine(val => val.length > 0, { message: "Course tag cannot be empty or spaces only" })
),

});


export async function createCourse(data: any) {
    try {

        const result = courseSchema.safeParse(data);

        if (!result.success) {
            const errorMessages = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
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
            where.name = { contains: filter.name, mode: 'insensitive' };
        }

        if (filter?.organized_by) {
            where.organized_by = { contains: filter.organized_by, mode: 'insensitive' };
        }

        const courses = await prisma.course.findMany({
            where,
            orderBy: { created_at: 'desc' },
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
    // Validate all data using full schema
    const result = courseSchema.safeParse(data);

    if (!result.success) {
      const errorMessages = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      console.error("Validation failed:", errorMessages);
      throw new Error(errorMessages[0]);
    }

    // Use validated data
    const validatedData = result.data;

    // Dates are already coerced into Date objects by z.coerce.date()

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
