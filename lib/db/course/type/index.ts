import { z } from "zod";

export type Course = {
  id: number;
  name: string;
  description: string;
  organized_by: string;
  application_start_date: string;
  application_end_date: string;
  course_start_date: string;
  course_end_date: string;
  eligibility_from: string;
  eligibility_to: string;
  reference_link: string;
  requirements: string[];
  course_tags: string[];
  created_at: string;
  updated_at: string;
};

export interface CourseCreateInput {
  name: string;
  description: string;
  organized_by: string;
  application_start_date: Date | string;
  application_end_date: Date | string;
  course_start_date: Date | string;
  course_end_date: Date | string;
  eligibility_from: string;
  eligibility_to: string;
  reference_link?: string;
  requirements: string[];
  course_tags: string[];
}

export interface CourseUpdateInput extends Partial<CourseCreateInput> {}

export interface CourseFilter {
  name?: string;
  organized_by?: string;
}


