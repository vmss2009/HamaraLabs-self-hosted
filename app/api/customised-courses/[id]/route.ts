import { NextResponse } from "next/server";
import { 
  getCustomisedCompetitionById, 
  updateCustomisedCompetition, 
  deleteCustomisedCompetition,
  getCustomisedCompetitions
} from "@/lib/db/customised-competition/crud";
import { CustomisedCompetitionCreateInput } from "@/lib/db/customised-competition/type";

export async function GET(
  request: Request,
  { params }: any
) {
  try {
    // If id is 'list', fetch all competitions for the student
    if (params.id === 'list') {
      const { searchParams } = new URL(request.url);
      const student_id = searchParams.get('student_id');
      
      if (!student_id) {
        return NextResponse.json(
          { error: "Student ID is required" },
          { status: 400 }
        );
      }

      const customisedCompetitions = await getCustomisedCompetitions({ student_id: parseInt(student_id) });
      return NextResponse.json(customisedCompetitions);
    }

    // Otherwise, fetch a single competition by ID
    const customisedCompetition = await getCustomisedCompetitionById(parseInt(params.id));
    
    if (!customisedCompetition) {
      return NextResponse.json(
        { error: "Customised competition not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(customisedCompetition);
  } catch (error) {
    console.error("Error fetching customised competition:", error);
    return NextResponse.json(
      { error: "Failed to fetch customised competition" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: any
) {
  try {
    const id = parseInt(params.id);
    const data = await request.json();
    
    // Validate required fields
    if (!data.competition_id || !data.student_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    const customisedCompetition = await updateCustomisedCompetition(
      id,
      data as Partial<CustomisedCompetitionCreateInput>
    );
    
    return NextResponse.json(customisedCompetition);
  } catch (error) {
    console.error("Error updating customised competition:", error);
    return NextResponse.json(
      { error: "Failed to update customised competition" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: any
) {
  try {
    const id = parseInt(params.id);
    await deleteCustomisedCompetition(id);
    
    return NextResponse.json({ message: "Customised competition deleted successfully" });
  } catch (error) {
    console.error("Error deleting customised competition:", error);
    return NextResponse.json(
      { error: "Failed to delete customised competition" },
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

    // Update the customized competition
    const updatedCompetition = await updateCustomisedCompetition(id, {
      status: body.status,
    });

    return NextResponse.json(updatedCompetition);
  } catch (error) {
    console.error("Error updating customised competition:", error);
    return NextResponse.json(
      { error: "Failed to update customised competition" },
      { status: 500 }
    );
  }
} 