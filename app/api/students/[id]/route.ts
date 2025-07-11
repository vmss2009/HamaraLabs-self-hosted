import { NextResponse } from "next/server";
import {
  getStudentById,
  updateStudent,
  deleteStudent,
} from "@/lib/db/student/crud";
import { StudentCreateInput, studentSchema  } from "@/lib/db/student/type";

export async function GET(request: Request, { params }: any) {
  try {
    const student = await getStudentById(params.id);

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error("Error fetching student:", error);
    return NextResponse.json(
      { error: "Failed to fetch student" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: any) {
  try {
    const data = await request.json();

    const result = studentSchema.safeParse(data);

    if (!result.success) {
      const errorMessages = result.error.errors.map((err) => err.message);
      console.error("Validation failed:", errorMessages);
      return NextResponse.json({ error: errorMessages[0] }, { status: 400 });
    }

    const validatedData = result.data;
    const schoolId = validatedData.schoolId;
    if (!schoolId) {
      return NextResponse.json({ error: "Invalid school ID" }, { status: 400 });
    }

    const studentInput: StudentCreateInput = {
      first_name: validatedData.first_name,
      last_name: validatedData.last_name,
      aspiration: validatedData.aspiration,
      gender: validatedData.gender,
      email: validatedData.email,
      class: validatedData.class,
      section: validatedData.section,
      comments: validatedData.comments ?? "",
      schoolId: schoolId,
    };

    const student = await updateStudent(params.id, studentInput);
    return NextResponse.json(student);
  } catch (error) {
    console.error("Error updating student:", error);
    return NextResponse.json(
      { error: "Failed to update student" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: any) {
  try {
    await deleteStudent(params.id);
    return NextResponse.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json(
      { error: "Failed to delete student" },
      { status: 500 }
    );
  }
}
