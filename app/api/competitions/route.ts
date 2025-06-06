import { NextResponse } from "next/server";
import { createCompetition, getCompetitions } from "@/lib/db/competition/crud";
import { CompetitionCreateInput } from "@/lib/db/competition/type";

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

    const competition = await createCompetition(competitionData);
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
