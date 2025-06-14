import { NextResponse } from "next/server";
import { createCompetition, getCompetitions } from "@/lib/db/competition/crud";
import { CompetitionCreateInput } from "@/lib/db/competition/type";
import { z } from "zod";

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

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const requiredFields = [
      "name",
      "description",
      "organised_by",
      "application_start_date",
      "application_end_date",
      "competition_start_date",
      "competition_end_date",
      "eligibility",
      "reference_links",
      "requirements",
      "payment",
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const competitionData: CompetitionCreateInput = {
      name: body.name,
      description: body.description,
      organised_by: body.organised_by,
      application_start_date: new Date(body.application_start_date),
      application_end_date: new Date(body.application_end_date),
      competition_start_date: new Date(body.competition_start_date),
      competition_end_date: new Date(body.competition_end_date),
      eligibility: Array.isArray(body.eligibility) ? body.eligibility : [],
      reference_links: Array.isArray(body.reference_links)
        ? body.reference_links
        : [],
      requirements: Array.isArray(body.requirements) ? body.requirements : [],
      payment: body.payment,
      fee: body.payment === "paid" ? body.fee : null,
    };

    const result = competitionSchema.safeParse(competitionData);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0]?.message ?? "Invalid data" },
        { status: 400 }
      );
    }

    const competition = await createCompetition(result.data);
    return NextResponse.json(competition);
  } catch (error) {
    console.error("Error creating competition:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create competition",
      },
      { status: 400 }
    );
  }
}

export async function GET() {
  try {
    const competitions = await getCompetitions();
    return NextResponse.json(competitions);
  } catch (error) {
    console.error("Error fetching competitions:", error);
    return NextResponse.json(
      { message: "Failed to fetch competitions" },
      { status: 500 }
    );
  }
}
