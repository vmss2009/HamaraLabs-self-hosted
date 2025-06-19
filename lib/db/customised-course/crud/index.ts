import { CustomisedCourseCreateInput, CustomisedCourseFilter, CustomisedCourseWithRelations } from "../type";
import { prisma } from "@/lib/db/prisma";

export async function createCustomisedCourse(
  data: CustomisedCourseCreateInput,
): Promise<CustomisedCourseWithRelations> {
  return prisma.customisedCourse.create({
    data: {
      course_id: data.course_id,
      student_id: data.student_id,
      status: data.status,
    },
    include: {
      course: {
        select: {
          id: true,
          name: true,
          description: true,
          organized_by: true,
          application_start_date: true,
          application_end_date: true,
          course_start_date: true,
          course_end_date: true,
          eligibility_from: true,
          eligibility_to: true,
          reference_link: true,
          requirements: true,
          course_tags: true,
        },
      },
      student: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
        },
      },
    },
  });
}

export async function getCustomisedCourses(
  filter?: CustomisedCourseFilter,
): Promise<CustomisedCourseWithRelations[]> {
  return prisma.customisedCourse.findMany({
    where: {
      course_id: filter?.course_id,
      student_id: filter?.student_id,
      status: filter?.status ? { hasSome: filter.status } : undefined,
    },
    include: {
      course: {
        select: {
          id: true,
          name: true,
          description: true,
          organized_by: true,
          application_start_date: true,
          application_end_date: true,
          course_start_date: true,
          course_end_date: true,
          eligibility_from: true,
          eligibility_to: true,
          reference_link: true,
          requirements: true,
          course_tags: true,
        },
      },
      student: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
        },
      },
    },
  });
}

export async function getCustomisedCourseById(
  id: string,
): Promise<CustomisedCourseWithRelations | null> {
  return prisma.customisedCourse.findUnique({
    where: { id },
    include: {
      course: {
        select: {
          id: true,
          name: true,
          description: true,
          organized_by: true,
          application_start_date: true,
          application_end_date: true,
          course_start_date: true,
          course_end_date: true,
          eligibility_from: true,
          eligibility_to: true,
          reference_link: true,
          requirements: true,
          course_tags: true,
        },
      },
      student: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
        },
      },
    },
  });
}

export async function updateCustomisedCourse(
  id: string,
  data: Partial<CustomisedCourseCreateInput>,
): Promise<CustomisedCourseWithRelations> {
  return prisma.customisedCourse.update({
    where: { id },
    data: {
      course_id: data.course_id,
      student_id: data.student_id,
      status: data.status,
    },
    include: {
      course: {
        select: {
          id: true,
          name: true,
          description: true,
          organized_by: true,
          application_start_date: true,
          application_end_date: true,
          course_start_date: true,
          course_end_date: true,
          eligibility_from: true,
          eligibility_to: true,
          reference_link: true,
          requirements: true,
          course_tags: true,
        },
      },
      student: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
        },
      },
    },
  });
}

export async function deleteCustomisedCourse(
  id: string,
): Promise<CustomisedCourseWithRelations> {
  return prisma.customisedCourse.delete({
    where: { id },
    include: {
      course: {
        select: {
          id: true,
          name: true,
          description: true,
          organized_by: true,
          application_start_date: true,
          application_end_date: true,
          course_start_date: true,
          course_end_date: true,
          eligibility_from: true,
          eligibility_to: true,
          reference_link: true,
          requirements: true,
          course_tags: true,
        },
      },
      student: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
        },
      },
    },
  });
}
