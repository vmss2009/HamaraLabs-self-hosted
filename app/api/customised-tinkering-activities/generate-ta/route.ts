import { NextRequest } from "next/server";
import { failure, success } from "@/lib/api/http";
import { generateCustomisedTinkeringActivity } from "@/lib/db/customised-tinkering-activity/crud";
import { DetailedTAGenerationInput } from "@/lib/db/customised-tinkering-activity/type";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    if (!body.activityIntroduction || typeof body.activityIntroduction !== "string") {
      return failure("activityIntroduction is required and must be a string", 400, { code: "VALIDATION_ERROR" });
    }

    if (!body.aspiration || typeof body.aspiration !== "string") {
      return failure("aspiration is required and must be a string", 400, { code: "VALIDATION_ERROR" });
    }

    if (!body.comments || typeof body.comments !== "string") {
      return failure("comments is required and must be a string", 400, { code: "VALIDATION_ERROR" });
    }

    const resources = body.resources || "";

    const input: DetailedTAGenerationInput = {
      activityIntroduction: body.activityIntroduction,
      aspiration: body.aspiration,
      comments: body.comments,
      resources: resources,
    };

    const detailedTA = await generateCustomisedTinkeringActivity(input);

    return success({
      success: true,
      data: detailedTA,
    });

  } catch (error) {
    console.error("Error generating detailed tinkering activity:", error);
    
    return failure("Failed to generate detailed tinkering activity", 500, {
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
