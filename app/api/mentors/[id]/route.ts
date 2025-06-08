import { NextResponse } from "next/server";
import { getMentorById, updateMentor, deleteMentor } from "@/lib/db/mentor/crud";
import { MentorUpdateInput } from "@/lib/db/mentor/type";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const mentor = await getMentorById(params.id);
    if (!mentor) {
      return NextResponse.json(
        { error: "Mentor not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(mentor);
  } catch (error) {
    console.error("Error fetching mentor:", error);
    return NextResponse.json(
      { error: "Failed to fetch mentor" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updateData: MentorUpdateInput = {
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      user_meta_data: body.user_meta_data,
      school_ids: body.school_ids
    };

    const mentor = await updateMentor(params.id, updateData);
    return NextResponse.json(mentor);
  } catch (error) {
    console.error("Error updating mentor:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update mentor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await deleteMentor(params.id);
    return NextResponse.json({ message: "Mentor deleted successfully" });
  } catch (error) {
    console.error("Error deleting mentor:", error);
    return NextResponse.json(
      { error: "Failed to delete mentor" },
      { status: 500 }
    );
  }
} 