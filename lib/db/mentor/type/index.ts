import { z } from "zod";
import { Mentor as PrismaMentor, User, School } from "@prisma/client";

export type MentorWithUser = PrismaMentor & {
  user?: User | null;
};

export type MentorWithSchools = PrismaMentor & {
  user?: User | null;
  schools?: School[];
};

export type MentorCreateInput = {
  first_name: string;
  last_name: string;
  email?: string;
  phone_number?: string;
  school_ids: string[];
  comments?: string;
};

export interface MentorUpdateInput {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  school_ids?: string[];
  comments?: string;
}

export interface MentorFilter {
  name?: string;
  email?: string;
  schoolId?: string;
}

export const mentorSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone_number: z.string().optional(),
  school_ids: z
    .array(z.string().uuid("Invalid school ID"))
    .min(1, "At least one school ID is required"),
  comments: z.string().optional(),
});
