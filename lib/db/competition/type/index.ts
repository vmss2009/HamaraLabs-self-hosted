import { z } from "zod";

export interface Competition {
  id: string;
  name: string;
  description: string;
  organised_by: string;
  application_start_date: string;
  application_end_date: string;
  competition_start_date: string;
  competition_end_date: string;
  eligibility: string[];
  constraints: string[];
  reference_links: string[];
  requirements: string[];
  payment: string;
  fee: string | null;
}

export interface CompetitionCreateInput {
  name: string;
  description: string;
  eligibility: string[];
  requirements: string[];
  fee?: string | null;
  payment: string;
  application_end_date: Date;
  application_start_date: Date;
  competition_end_date: Date;
  competition_start_date: Date;
  organised_by: string;
  reference_links: string[];
}

export interface CompetitionUpdateInput
  extends Partial<CompetitionCreateInput> {}

export interface CompetitionFilter {
  name?: string;
  organised_by?: string;
  payment?: string;
}

export const competitionSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    description: z.string().trim().min(1, "Description is required"),
    organised_by: z.string().trim().min(1, "Organised by is required"),
    application_start_date: z.coerce.date(),
    application_end_date: z.coerce.date(),
    competition_start_date: z.coerce.date(),
    competition_end_date: z.coerce.date(),
    eligibility: z
      .array(z.string().trim())
      .min(1, "At least one eligibility criterion is required"),
    requirements: z
      .array(
        z
          .string()
          .transform((val) => val.trim())
          .refine((val) => val.length > 0, {
            message: "Requirement cannot be empty or spaces only",
          })
      )
      .min(1, "At least one requirement is required"),
    reference_links: z
      .array(z.string().trim())
      .transform((links) => links.filter((link) => link !== ""))
      .refine(
        (links) =>
          links.every((link) => z.string().url().safeParse(link).success),
        { message: "Each reference link must be a valid URL" }
      ),
    fee: z.string().trim().nullable().optional(),
    payment: z.string().trim().min(1, "Payment method is required"),
    comments: z.string().trim().optional().default(""),
  })
  .refine(
    (data) => {
      if (data.payment === "paid") {
        return typeof data.fee === "string" && data.fee.trim() !== "";
      }
      return true;
    },
    {
      message: "Fee is required when payment is 'paid'",
      path: ["fee"],
    }
  );