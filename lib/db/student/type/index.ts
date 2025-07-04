import { Student as PrismaStudent } from "@prisma/client";
import { z } from "zod";

export interface Student {
  instructions?: string;
  id: string;
  first_name: string;
  last_name: string;
}

export interface StudentCreateInput {
  first_name: string;
  last_name: string;
  aspiration: string;
  gender: string;
  email?: string;
  class: string;
  section: string;
  comments?: string;
  schoolId: string;
}

export interface StudentWithSchool extends PrismaStudent {
  school: {
    id: string;
    name: string;
    is_ATL: boolean;
  };
}

export interface StudentFilter {
  first_name?: string;
  last_name?: string;
  gender?: string;
  class?: string;
  section?: string;
  schoolId?: string;
}

export const studentSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required"),
  last_name: z.string().trim().min(1, "Last name is required"),
  aspiration: z.string().trim().min(1, "Aspiration is required"),
  gender: z
    .string()
    .transform((val) => val.toLowerCase())
    .pipe(z.enum(["male", "female", "other"])),
  email: z.string().email("Invalid email address"),
  class: z.string().trim().min(1, "Class is required"),
  section: z.string().trim().min(1, "Section is required"),
  comments: z.string().trim().optional().nullable(),
  schoolId: z.string().uuid("schoolId must be a valid UUID"),
});