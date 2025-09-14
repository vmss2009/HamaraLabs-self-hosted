import { failure, success } from "@/lib/api/http";
import { createCustomisedTinkeringActivity } from "@/lib/db/customised-tinkering-activity/crud";
import { CustomisedTinkeringActivityCreateInput } from "@/lib/db/customised-tinkering-activity/type";
import { getTinkeringActivityById } from "@/lib/db/tinkering-activity/crud";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const requiredFields = ["id", "student_id", "status"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return failure(`Missing required field: ${field}`, 400, { code: "VALIDATION_ERROR" });
      }
    }

    const baseTA = await getTinkeringActivityById(body.id);
    if (!baseTA) {
      return failure("Base tinkering activity not found", 404);
    }

    const tinkeringActivityData: CustomisedTinkeringActivityCreateInput = {
      name: baseTA.name,
      subtopic_id: baseTA.subtopic_id,
      introduction: baseTA.introduction,
      goals: baseTA.goals,
      materials: baseTA.materials,
      instructions: baseTA.instructions,
      tips: baseTA.tips,
      observations: baseTA.observations,
      extensions: baseTA.extensions,
      resources: baseTA.resources,
      base_ta_id: body.id,
      student_id: body.student_id,
      status: Array.isArray(body.status) ? body.status : [body.status],
    };

    const customisedTinkeringActivity = await createCustomisedTinkeringActivity(
      tinkeringActivityData
    );
    return success(customisedTinkeringActivity);
  } catch (error) {
    console.error("Error creating customised tinkering activity:", error);
    return failure("Failed to create customised tinkering activity", 500, {
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
