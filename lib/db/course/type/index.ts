import { Course as PrismaCourse } from "@prisma/client";

export interface CourseCreateInput {
  name: string;
  description: string;
  organized_by: string;
  application_start_date: Date | string;
  application_end_date: Date | string;
  course_start_date: Date | string;
  course_end_date: Date | string;
  eligibility_from: string;   // as per your Prisma schema, this is String
  eligibility_to: string;     // same here
  reference_link?: string;
  requirements: string[];     // always an array of strings
  course_tags: string[];      // always an array of strings
}

export interface CourseWithRelations {
  id: string;
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
  created_at: Date;
  updated_at: Date;
  CustomisedCourse?: {
    id: string;
    student_id: string;
    status: string[];
  }[];
}

export interface CourseUpdateInput extends Partial<CourseCreateInput> {}

export interface CourseFilter {
  name?: string;
  organized_by?: string;
}
