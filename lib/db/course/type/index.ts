import { z } from "zod";

export type Course = {
  id: string;
  name: string;
  description: string;
  organised_by: string;
  application_start_date: string;
  application_end_date: string;
  course_start_date: string;
  course_end_date: string;
  eligibility_from: string;
  eligibility_to: string;
  reference_link: string;
  requirements: string[];
  course_tags: string[];
  comments: string;
  created_at: string;
  updated_at: string;
};

export interface CourseCreateInput {
  name: string;
  description: string;
  organised_by: string;
  application_start_date: Date | string;
  application_end_date: Date | string;
  course_start_date: Date | string;
  course_end_date: Date | string;
  eligibility_from: string;
  eligibility_to: string;
  reference_link?: string;
  requirements: string[];
  course_tags: string[];
  comments: string;
}

export interface CourseUpdateInput extends Partial<CourseCreateInput> {}

export interface CourseFilter {
  name?: string;
  organised_by?: string;
}

export const courseSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().min(1, "Description is required"),
  organised_by: z.string().trim().min(1, "Organised by is required"),
  application_start_date: z.coerce.date(),
  application_end_date: z.coerce.date(),
  course_start_date: z.coerce.date(),
  course_end_date: z.coerce.date(),
  eligibility_from: z.string().trim().min(1, "Eligibility from is required"),
  eligibility_to: z.string().trim().min(1, "Eligibility to is required"),
  reference_link: z
    .string()
    .trim()
    .url("Reference link must be a valid URL")
    .optional()
    .or(z.literal("")),

  requirements: z.array(z.string().trim()).optional().default([]),

  course_tags: z.array(z.string().trim()).optional().default([]),
  
  comments: z.string().trim().optional().default(""),
});