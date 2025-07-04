import { SchoolVisit as PrismaSchoolVisit } from "@prisma/client";
import { z } from "zod";

export interface SchoolVisitCreateInput {
  school_id: string;
  visit_date: Date;
  poc_id?: string | null;
  other_poc?: string;
  school_performance?: string;
  details: Record<string, string>;
}

export interface SchoolVisitUpdateInput {
  school_id: string;
  visit_date: Date;
  poc_id?: string | null;
  other_poc?: string;
  school_performance?: string;
  details: Record<string, string>;
}

export interface SchoolVisitFilter {
  school_id?: string;
  visit_date?: Date;
  poc_id?: string;
  school_performance?: string;
}

export interface SchoolVisitWithRelations extends PrismaSchoolVisit {
  id: string;
  school: {
    id: string;
    name: string;
  };
  point_of_contact: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
  } | null;
}

export const schoolVisitSchema = z.object({
  school_id: z.string().uuid("Invalid school ID"),
  visit_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid visit date",
  }),
  poc_id: z.string().nullable().optional(),

  other_poc: z.string().optional(),
  uc_submissions: z.string().optional(),
  planned_showcase_date: z.string().optional(),
  school_performance: z.enum([
    "Good performing",
    "Medium performing",
    "Bad performing",
  ]),
  details: z.record(z.string(), z.string()),
});