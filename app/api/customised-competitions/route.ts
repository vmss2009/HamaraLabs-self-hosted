import { NextResponse } from "next/server";
import { createCustomisedCompetition } from "@/lib/db/customised-competition/crud";
import { CustomisedCompetitionCreateInput } from "@/lib/db/customised-competition/type";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const requiredFields = ["id", "student_id", "status"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
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
    return NextResponse.json(customisedCompetition);
  } catch (error) {
    console.error("Error creating customised competition:", error);
    return NextResponse.json(
      { error: "Failed to create customised competition" },
      { status: 500 }
    );
  }
}
