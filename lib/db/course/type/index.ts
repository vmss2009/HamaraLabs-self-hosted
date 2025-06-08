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

export interface CourseUpdateInput extends Partial<CourseCreateInput> {}

export interface CourseFilter {
  name?: string;
  organized_by?: string;
}
