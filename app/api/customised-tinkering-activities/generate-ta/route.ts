import { NextRequest, NextResponse } from "next/server";
import { generateCustomisedTinkeringActivity } from "@/lib/db/customised-tinkering-activity/crud";
import { DetailedTAGenerationInput } from "@/lib/db/customised-tinkering-activity/type";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    if (!body.activityIntroduction || typeof body.activityIntroduction !== "string") {
      return NextResponse.json(
        { error: "activityIntroduction is required and must be a string" },
        { status: 400 }
      );
    }

    if (!body.aspiration || typeof body.aspiration !== "string") {
      return NextResponse.json(
        { error: "aspiration is required and must be a string" },
        { status: 400 }
      );
    }

    if (!body.comments || typeof body.comments !== "string") {
      return NextResponse.json(
        { error: "comments is required and must be a string" },
        { status: 400 }
      );
    }

    const resources = body.resources || "";

    const input: DetailedTAGenerationInput = {
      activityIntroduction: body.activityIntroduction,
      aspiration: body.aspiration,
      comments: body.comments,
      resources: resources,
    };

    const detailedTA = await generateCustomisedTinkeringActivity(input);

    return NextResponse.json({
      success: true,
      data: detailedTA,
    });

  } catch (error) {
    console.error("Error generating detailed tinkering activity:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to generate detailed tinkering activity",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
