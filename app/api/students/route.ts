import { NextResponse } from "next/server";
import { createStudent, getStudents, getStudentById } from "@/lib/db/student/crud";
import { StudentCreateInput } from "@/lib/db/student/type";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // If ID is provided, return a single student
    if (id) {
      const student = await getStudentById(id);
      if (!student) {
        return NextResponse.json(
          { error: "Student not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(student);
    }
    
    // Build filter object from query parameters
    const filter = {
      first_name: searchParams.get('first_name') || undefined,
      last_name: searchParams.get('last_name') || undefined,
      gender: searchParams.get('gender') || undefined,
      class: searchParams.get('class') || undefined,
      section: searchParams.get('section') || undefined,
      school_id: searchParams.get('school_id') || undefined
    };
    
    const students = await getStudents(filter);
    return NextResponse.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.first_name || !data.last_name || !data.schoolId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const studentInput: StudentCreateInput = {
      first_name: data.first_name,
      last_name: data.last_name,
      aspiration: data.aspiration,
      gender: data.gender,
      email: data.email,
      class: data.class,
      section: data.section,
      comments: data.comments,
      schoolId: data.schoolId
    };
    
    const student = await createStudent(studentInput);
    return NextResponse.json(student);
  } catch (error) {
    console.error("Error creating student:", error);
    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 500 }
    );
  }
} 