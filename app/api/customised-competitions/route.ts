import { failure, success } from "@/lib/api/http";
import { createCustomisedCompetition } from "@/lib/db/customised-competition/crud";
import { CustomisedCompetitionCreateInput } from "@/lib/db/customised-competition/type";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const requiredFields = ["id", "student_id", "status"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return failure(`Missing required field: ${field}`, 400, { code: "VALIDATION_ERROR" });
      }
    }

    const competitionData: CustomisedCompetitionCreateInput = {
      competition_id: body.id,
      student_id: body.student_id,
      status: Array.isArray(body.status) ? body.status : [body.status],
    };

    const customisedCompetition = await createCustomisedCompetition(
      competitionData
    );
    return success(customisedCompetition);
  } catch (error) {
    console.error("Error creating customised competition:", error);
    return failure("Failed to create customised competition", 500, {
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
