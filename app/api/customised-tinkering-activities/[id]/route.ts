import { NextResponse } from "next/server";
import { 
  getCustomisedTinkeringActivityById, 
  updateCustomisedTinkeringActivity, 
  deleteCustomisedTinkeringActivity,
  createCustomisedTinkeringActivity,
  getCustomisedTinkeringActivities
} from "@/lib/db/customised-tinkering-activity/crud";
import { CustomisedTinkeringActivityCreateInput } from "@/lib/db/customised-tinkering-activity/type";

export async function GET(
  request: Request,
  { params }: any
) {
  try {
    // If id is 'list', fetch all activities for the student
    if (params.id === 'list') {
      const { searchParams } = new URL(request.url);
      const studentId = searchParams.get('student_id');
      
      if (!studentId) {
        return NextResponse.json(
          { error: "Student ID is required" },
          { status: 400 }
        );
      }

      const customisedTAs = await getCustomisedTinkeringActivities({ student_id: parseInt(studentId) });
      return NextResponse.json(customisedTAs);
    }

    // Otherwise, fetch a single activity by ID
    const customisedTA = await getCustomisedTinkeringActivityById(parseInt(params.id));

    if (!customisedTA) {
      return NextResponse.json(
        { error: "Customised tinkering activity not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(customisedTA);
  } catch (error) {
    console.error("Error fetching customised tinkering activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch customised tinkering activity" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: any
) {
  try {
    const id = parseInt(params.id, 10);
    const body = await request.json();
    
    // Update the customized tinkering activity
    const updatedActivity = await updateCustomisedTinkeringActivity(id, {
      name: body.name,
      subtopic_id: body.subtopic_id,
      introduction: body.introduction,
      goals: body.goals,
      materials: body.materials,
      instructions: body.instructions,
      tips: body.tips,
      observations: body.observations,
      extensions: body.extensions,
      resources: body.resources,
    });

    return NextResponse.json(updatedActivity);
  } catch (error) {
    console.error("Error updating customised tinkering activity:", error);
    return NextResponse.json(
      { error: "Failed to update customised tinkering activity" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: any
) {
  try {
    await deleteCustomisedTinkeringActivity(parseInt(params.id));
    return NextResponse.json({ message: "Customised tinkering activity deleted successfully" });
  } catch (error) {
    console.error("Error deleting customised tinkering activity:", error);
    return NextResponse.json(
      { error: "Failed to delete customised tinkering activity" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: any
) {
  try {
    const id = parseInt(params.id, 10);
    const body = await request.json();
    
    // Validate that status is provided
    if (!body.status || !Array.isArray(body.status)) {
      return NextResponse.json(
        { error: "Status must be an array" },
        { status: 400 }
      );
    }

    // Update the customized tinkering activity
    const updatedActivity = await updateCustomisedTinkeringActivity(id, {
      status: body.status,
    });

    return NextResponse.json(updatedActivity);
  } catch (error) {
    console.error("Error updating customised tinkering activity:", error);
    return NextResponse.json(
      { error: "Failed to update customised tinkering activity" },
      { status: 500 }
    );
  }
} 