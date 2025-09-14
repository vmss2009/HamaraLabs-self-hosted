import { NextRequest } from "next/server";
import { failure, success } from "@/lib/api/http";
import { generateCustomisedTinkeringActivities } from "@/lib/db/customised-tinkering-activity/crud";
import { TinkeringActivityGenerationInput } from "@/lib/db/customised-tinkering-activity/type";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    if (!body.previousActivities || !Array.isArray(body.previousActivities)) {
      return failure("previousActivities is required and must be an array", 400, { code: "VALIDATION_ERROR" });
    }

    if (!body.prompt || typeof body.prompt !== "string") {
      return failure("prompt is required and must be a string", 400, { code: "VALIDATION_ERROR" });
    }

    const input: TinkeringActivityGenerationInput = {
      previousActivities: body.previousActivities,
      prompt: body.prompt,
    };

    const generatedActivities = await generateCustomisedTinkeringActivities(input);

    return success({
      success: true,
      data: generatedActivities,
      count: generatedActivities.length,
    });

  } catch (error) {
    console.error("Error generating tinkering activities:", error);
    
    return failure("Failed to generate tinkering activities", 500, {
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
