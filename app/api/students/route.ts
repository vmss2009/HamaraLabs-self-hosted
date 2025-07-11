import { NextResponse } from "next/server";
import {
  createStudent,
  getStudents,
  getStudentById,
} from "@/lib/db/student/crud";
import { StudentCreateInput, studentSchema } from "@/lib/db/student/type";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

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

    const filter = {
      first_name: searchParams.get("first_name") || undefined,
      last_name: searchParams.get("last_name") || undefined,
      gender: searchParams.get("gender") || undefined,
      class: searchParams.get("class") || undefined,
      section: searchParams.get("section") || undefined,
      schoolId: searchParams.get("schoolId") || undefined,
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
    const result = studentSchema.safeParse(data);

    if (!result.success) {
      const errorMessages = result.error.errors.map((err) => err.message);
      console.error("Validation failed:", errorMessages);
      return NextResponse.json({ error: errorMessages[0] }, { status: 400 });
    }

    const validatedData = result.data;

    const studentInput: StudentCreateInput = {
      first_name: validatedData.first_name,
      last_name: validatedData.last_name,
      aspiration: validatedData.aspiration,
      gender: validatedData.gender,
      email: validatedData.email,
      class: validatedData.class,
      section: validatedData.section,
      comments: validatedData.comments ?? "",
      schoolId: validatedData.schoolId,
    };

    const student = await createStudent(studentInput);
    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error("Error creating student:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create student",
      },
      { status: 400 }
    );
  }
}
