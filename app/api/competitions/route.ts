import { failure, success } from "@/lib/api/http";
import { createCompetition, getCompetitions } from "@/lib/db/competition/crud";
import { CompetitionCreateInput, competitionSchema } from "@/lib/db/competition/type";

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
        return failure(`Missing required field: ${field}`, 400, { code: "VALIDATION_ERROR" });
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
      return failure(result.error.errors[0]?.message ?? "Invalid data", 400, {
        code: "VALIDATION_ERROR",
        details: result.error.flatten(),
      });
    }

    const competition = await createCompetition(result.data);
    return success(competition);
  } catch (error) {
    console.error("Error creating competition:", error);

    return failure(
      error instanceof Error ? error.message : "Failed to create competition",
      400
    );
  }
}

export async function GET() {
  try {
    const competitions = await getCompetitions();
    return success(competitions);
  } catch (error) {
    console.error("Error fetching competitions:", error);
    return failure("Failed to fetch competitions", 500, {
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
