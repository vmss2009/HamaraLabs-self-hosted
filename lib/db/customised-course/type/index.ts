import { CustomisedCourse as PrismaCustomisedCourse } from "@prisma/client";

export interface CustomisedCourseCreateInput {
  course_id: number;
  student_id: number;
  status: string[];
}

export interface CustomisedCourseWithRelations extends PrismaCustomisedCourse {
  course: {
    id: number;
    name: string;
    description: string;
    organized_by: string;
    application_start_date: Date;
    application_end_date: Date;
    course_start_date: Date;
    course_end_date: Date;
    eligibility_from: string;
    eligibility_to: string;
    reference_link: string;
    requirements: string[];
    course_tags: string[];
  };
  student: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

export interface CustomisedCourseFilter {
  course_id?: number;
  student_id?: number;
  status?: string[];
}
