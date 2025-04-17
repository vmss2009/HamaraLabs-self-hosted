import { NextResponse } from "next/server";
import { getTinkeringActivityById, updateTinkeringActivity, deleteTinkeringActivity } from "@/lib/db/tinkering-activity/crud";

// GET a single tinkering activity by ID
export async function GET(
  request: Request,
  { params }: any
) {
  try {
    const id = parseInt(params.id);

    // Validate that id is a number
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid ID format" },
        { status: 400 }
      );
    }
    
    const activity = await getTinkeringActivityById(id);
    
    if (!activity) {
      return NextResponse.json(
        { error: "Tinkering activity not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(activity);
  } catch (error) {
    console.error("Error fetching tinkering activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch tinkering activity" },
      { status: 500 }
    );
  }
}

// UPDATE a tinkering activity
export async function PUT(
  request: Request,
  { params }: any
) {
  try {
    const id = parseInt(params.id);
    const data = await request.json();
    
    // Validate that id is a number
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid ID format" },
        { status: 400 }
      );
    }
    
    const activity = await updateTinkeringActivity(id, data);
    return NextResponse.json(activity);
  } catch (error) {
    console.error("Error updating tinkering activity:", error);
    return NextResponse.json(
      { error: "Failed to update tinkering activity" },
      { status: 500 }
    );
  }
}

// DELETE a tinkering activity
export async function DELETE(
  request: Request,
  { params }: any
) {
  try {
    const id = parseInt(params.id);

    // Validate that id is a number
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid ID format" },
        { status: 400 }
      );
    }
    
    await deleteTinkeringActivity(id);
    return NextResponse.json({ message: "Tinkering activity deleted successfully" });
  } catch (error) {
    console.error("Error deleting tinkering activity:", error);
    return NextResponse.json(
      { error: "Failed to delete tinkering activity" },
      { status: 500 }
    );
  }
} 