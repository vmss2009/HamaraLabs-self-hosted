import { failure, success } from "@/lib/api/http";
import {
  getCompetitionById,
  updateCompetition,
  deleteCompetition,
} from "@/lib/db/competition/crud";
import { competitionSchema } from "@/lib/db/competition/type";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) {
      return failure("Invalid competition ID", 400, { code: "INVALID_ID" });
    }

    const competition = await getCompetitionById(id);

    if (!competition) {
      return failure("Competition not found", 404);
    }

    return success(competition);
  } catch (error) {
    console.error("Error fetching competition:", error);
    return failure("Failed to fetch competition", 500, {
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) {
      return failure("Invalid competition ID", 400, { code: "INVALID_ID" });
    }

    const competition = await getCompetitionById(id);
    if (!competition) {
      return failure("Competition not found", 404);
    }

    await deleteCompetition(id);

    return success({ message: "Competition deleted successfully" });
  } catch (error) {
    console.error("Error deleting competition:", error);
    return failure("Failed to delete competition", 500, {
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) {
      return failure("Invalid competition ID", 400, { code: "INVALID_ID" });
    }

    const competition = await getCompetitionById(id);
    if (!competition) {
      return failure("Competition not found", 404);
    }

    const body = await request.json();
    const {
      name,
      description,
      organised_by: organisedBy,
      application_start_date: applicationStartDate,
      application_end_date: applicationEndDate,
      competition_start_date: competitionStartDate,
      competition_end_date: competitionEndDate,
      eligibility,
      reference_links: referenceLinks,
      requirements,
      payment,
      fee,
    } = body as Record<string, unknown>;

    const competitionData = {
      name: name as string,
      description: description as string,
      organised_by: organisedBy as string,
      application_start_date: new Date(String(applicationStartDate)),
      application_end_date: new Date(String(applicationEndDate)),
      competition_start_date: new Date(String(competitionStartDate)),
      competition_end_date: new Date(String(competitionEndDate)),
      eligibility: Array.isArray(eligibility) ? (eligibility as string[]) : [],
      reference_links: Array.isArray(referenceLinks)
        ? (referenceLinks as string[])
        : [],
      requirements: Array.isArray(requirements)
        ? (requirements as string[])
        : [],
      payment: payment as string,
      fee: (payment as string) === "paid" ? (fee as string) : null,
    };

    const result = competitionSchema.safeParse(competitionData);
    if (!result.success) {
      return failure(result.error.errors[0]?.message ?? "Invalid data", 400, {
        code: "VALIDATION_ERROR",
        details: result.error.flatten(),
      });
    }

    const updatedCompetition = await updateCompetition(id, result.data);

    return success(updatedCompetition);
  } catch (error) {
    console.error("Error updating competition:", error);

    return failure(
      error instanceof Error ? error.message : "Failed to update competition",
      400
    );
  }
}
