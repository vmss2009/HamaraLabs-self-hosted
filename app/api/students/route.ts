import { NextResponse } from "next/server";
import { createStudent, getStudents, getStudentById } from "@/lib/db/student/crud";
import { StudentCreateInput } from "@/lib/db/student/type";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const student = await getStudentById(parseInt(id));
      if (!student) {
        return NextResponse.json(
          { error: "Student not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(student);
    }

    const filter = {
      first_name: searchParams.get("first_name") || undefined,
      last_name: searchParams.get("last_name") || undefined,
      gender: searchParams.get("gender") || undefined,
      class: searchParams.get("class") || undefined,
      section: searchParams.get("section") || undefined,
      schoolId: searchParams.get("schoolId")
        ? parseInt(searchParams.get("schoolId") as string)
        : undefined,
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

    if (!data.first_name || !data.last_name || !data.schoolId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const schoolId = Number(data.schoolId);
    if (isNaN(schoolId)) {
      return NextResponse.json({ error: "Invalid school ID" }, { status: 400 });
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
      schoolId: schoolId,
    };
    console.log("Student data", studentInput);

    const student = await createStudent(studentInput);
    return NextResponse.json(student);
  } catch (error) {
    console.error("Error creating competition:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create competition",
      },
      { status: 400 }
    );
  }
}
