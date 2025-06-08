import { NextResponse } from "next/server";
import { createMentor, getMentors } from "@/lib/db/mentor/crud";
import { MentorCreateInput } from "@/lib/db/mentor/type";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = {
      name: searchParams.get("name") || undefined,
      email: searchParams.get("email") || undefined,
      schoolId: searchParams.get("schoolId") ? parseInt(searchParams.get("schoolId")!) : undefined,
    };

    const mentors = await getMentors(filter);
    return NextResponse.json(mentors);
  } catch (error) {
    console.error("Error fetching mentors:", error);
    return NextResponse.json(
      { error: "Failed to fetch mentors" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ["first_name", "last_name", "email", "school_ids"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const mentorData: MentorCreateInput = {
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      user_meta_data: body.user_meta_data || {},
      school_ids: body.school_ids
    };

    const mentor = await createMentor(mentorData);
    return NextResponse.json(mentor, { status: 201 });
  } catch (error) {
    console.error("Error creating mentor:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create mentor" },
      { status: 500 }
    );
  }
} 