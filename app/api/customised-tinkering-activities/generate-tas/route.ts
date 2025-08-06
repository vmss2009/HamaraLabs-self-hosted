import { NextRequest, NextResponse } from "next/server";
import { generateCustomisedTinkeringActivities } from "@/lib/db/customised-tinkering-activity/crud";
import { TinkeringActivityGenerationInput } from "@/lib/db/customised-tinkering-activity/type";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    if (!body.previousActivities || !Array.isArray(body.previousActivities)) {
      return NextResponse.json(
        { error: "previousActivities is required and must be an array" },
        { status: 400 }
      );
    }

    if (!body.prompt || typeof body.prompt !== "string") {
      return NextResponse.json(
        { error: "prompt is required and must be a string" },
        { status: 400 }
      );
    }

    const input: TinkeringActivityGenerationInput = {
      previousActivities: body.previousActivities,
      prompt: body.prompt,
    };

    const generatedActivities = await generateCustomisedTinkeringActivities(input);

    return NextResponse.json({
      success: true,
      data: generatedActivities,
      count: generatedActivities.length,
    });

  } catch (error) {
    console.error("Error generating tinkering activities:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to generate tinkering activities",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
