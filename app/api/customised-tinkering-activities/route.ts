import { NextResponse } from "next/server";
import { createCustomisedTinkeringActivity } from "@/lib/db/customised-tinkering-activity/crud";
import { CustomisedTinkeringActivityCreateInput } from "@/lib/db/customised-tinkering-activity/type";
import { getTinkeringActivityById } from "@/lib/db/tinkering-activity/crud";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ["base_ta_id", "student_id", "status"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Get the base tinkering activity to copy its fields
    const baseTA = await getTinkeringActivityById(body.base_ta_id);
    if (!baseTA) {
      return NextResponse.json(
        { error: "Base tinkering activity not found" },
        { status: 404 }
      );
    }

    // Prepare tinkering activity data with all required fields
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
      base_ta_id: body.base_ta_id,
      student_id: body.student_id,
      status: Array.isArray(body.status) ? body.status : [body.status],
    };

    const customisedTinkeringActivity = await createCustomisedTinkeringActivity(tinkeringActivityData);
    return NextResponse.json(customisedTinkeringActivity);
  } catch (error) {
    console.error("Error creating customised tinkering activity:", error);
    return NextResponse.json(
      { error: "Failed to create customised tinkering activity" },
      { status: 500 }
    );
  }
} 