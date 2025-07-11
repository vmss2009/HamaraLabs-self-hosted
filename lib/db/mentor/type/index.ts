import { SchoolWithAddress } from "../../school/type";
import { z } from "zod";

export interface Mentor {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  user_meta_data: {
    phone_number: string;
  };
  schools: SchoolWithAddress[];
}
export type MentorCreateInput = {
  first_name: string;
  last_name: string;
  email: string;
  user_meta_data?: {
    phone_number?: string;
  };
  school_ids: string[];
};

export interface MentorUpdateInput {
  first_name?: string;
  last_name?: string;
  email?: string;
  user_meta_data?: {
    phone_number: string;
  };
  school_ids?: string[];
}

export interface MentorFilter {
  name?: string;
  email?: string;
  schoolId?: string;
}

export const mentorSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  user_meta_data: z
    .object({
      phone_number: z.string().optional(),
    })
    .optional(),
  school_ids: z
    .array(z.string().uuid("Invalid school ID"))
    .min(1, "At least one school ID is required"),
});