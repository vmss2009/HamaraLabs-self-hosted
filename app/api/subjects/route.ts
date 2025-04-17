import { NextResponse } from "next/server";
import { createSubject, getSubjects } from "@/lib/db/tinkering-activity/crud";

export async function GET() {
  try {
    const subjects = await getSubjects();
    return NextResponse.json(subjects);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json(
      { message: "Error fetching subjects" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const subject = await createSubject(data);
    return NextResponse.json(subject);
  } catch (error) {
    console.error("Error creating subject:", error);
    return NextResponse.json(
      { message: "Error creating subject" },
      { status: 500 }
    );
  }
} 