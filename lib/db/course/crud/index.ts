// lib/db/course/crud.ts
import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
import { CourseCreateInput, CourseUpdateInput, CourseFilter } from "../type";

export async function createCourse(data: CourseCreateInput) {
    try {
        const formattedData: Prisma.CourseCreateInput = {
            name: data.name,
            description: data.description,
            organized_by: data.organized_by,
            application_start_date: new Date(data.application_start_date),
            application_end_date: new Date(data.application_end_date),
            course_start_date: new Date(data.course_start_date),
            course_end_date: new Date(data.course_end_date),
            eligibility_from: data.eligibility_from,
            eligibility_to: data.eligibility_to,
            reference_link: data.reference_link || "",
            requirements: data.requirements,
            course_tags: data.course_tags,
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

export async function updateCourse(id: number, data: CourseUpdateInput) {
    try {
        const formattedData: Prisma.CourseUpdateInput = {
            ...data,
        };

        if (data.application_start_date) {
            formattedData.application_start_date = new Date(data.application_start_date);
        }
        if (data.application_end_date) {
            formattedData.application_end_date = new Date(data.application_end_date);
        }
        if (data.course_start_date) {
            formattedData.course_start_date = new Date(data.course_start_date);
        }
        if (data.course_end_date) {
            formattedData.course_end_date = new Date(data.course_end_date);
        }

        const course = await prisma.course.update({
            where: { id },
            data: formattedData,
        });

        return course;
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
