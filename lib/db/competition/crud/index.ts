import { prisma } from "@/lib/db/prisma";
import { CompetitionCreateInput, CompetitionUpdateInput, CompetitionFilter } from "../type";

import { z } from "zod";

export const competitionSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().min(1, "Description is required"),
  organised_by: z.string().trim().min(1, "Organised by is required"),
  application_start_date: z.coerce.date(),
  application_end_date: z.coerce.date(),
  competition_start_date: z.coerce.date(),
  competition_end_date: z.coerce.date(),
  eligibility: z.array(z.string().trim()).min(1, "At least one eligibility criterion is required"),
  requirements: z
  .array(
    z.string()
      .transform(val => val.trim())
      .refine(val => val.length > 0, { message: "Requirement cannot be empty or spaces only" })
  )
  .min(1, "At least one requirement is required"),

reference_links: z
  .array(z.string().trim())
  .transform((links) => links.filter((link) => link !== ""))
  .refine((links) =>
    links.every((link) => z.string().url().safeParse(link).success),
    { message: "Each reference link must be a valid URL" }
  ),
  fee: z.string().trim().nullable().optional(),
  payment: z.string().trim().min(1, "Payment method is required"),
}).refine((data) => {
  if (data.payment === "paid") {
    return typeof data.fee === "string" && data.fee.trim() !== "";
  }
  return true;
}, {
  message: "Fee is required when payment is 'paid'",
  path: ["fee"],
});

export async function createCompetition(data: any) {
  try {
    // Validate input using Zod
    const result = competitionSchema.safeParse(data);

    if (!result.success) {
      const errorMessages = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      throw new Error(errorMessages[0]);
    }


    const { id, ...validatedData } = result.data as any;


    // Insert into database
    const competition = await prisma.competition.create({
      data: validatedData,
    });

    return competition;
  } catch (error) {
    throw error;
  }
}


export async function getCompetitions(filter?: CompetitionFilter) {
  try {
    const where: any = {};

    if (filter?.name) {
      where.name = { contains: filter.name, mode: 'insensitive' };
    }

    if (filter?.organised_by) {
      where.organised_by = { contains: filter.organised_by, mode: 'insensitive' };
    }

    if (filter?.payment) {
      where.payment = filter.payment;
    }

    const competitions = await prisma.competition.findMany({
      where,
      orderBy: {
        created_at: 'desc',
      },
    });

    return competitions;
  } catch (error) {
    console.error("Error fetching competitions:", error);
    throw error;
  }
}

export async function getCompetitionById(id: number) {
  try {
    const competition = await prisma.competition.findUnique({
      where: { id },
    });

    if (!competition) {
      throw new Error(`Competition with ID ${id} not found`);
    }

    return competition;
  } catch (error) {
    console.error(`Error fetching competition with ID ${id}:`, error);
    throw error;
  }
}

export async function updateCompetition(id: number, data: any) {
  try {
    // Validate all data with the full schema
    const result = competitionSchema.safeParse(data);

    if (!result.success) {
      const errorMessages = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      console.error("Validation failed:", errorMessages);
      throw new Error(errorMessages[0]);
    }

    // Use the validated data for the update
    const validatedData = result.data;

    // Prisma expects Date objects for date fields; z.coerce.date() already does that, so this should be fine

    const updatedCompetition = await prisma.competition.update({
      where: { id },
      data: validatedData,
    });

    return updatedCompetition;

  } catch (error) {
    console.error(`Error updating competition with ID ${id}:`, error);
    throw error;
  }
}

export async function deleteCompetition(id: number) {
  try {
    const competition = await prisma.competition.delete({
      where: { id },
    });

    return competition;
  } catch (error) {
    console.error(`Error deleting competition with ID ${id}:`, error);
    throw error;
  }
} 