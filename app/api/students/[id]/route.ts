import { NextResponse } from "next/server";
import { getStudentById, updateStudent, deleteStudent } from "@/lib/db/student/crud";
import { StudentCreateInput } from "@/lib/db/student/type";

export async function GET(request: Request, { params }: any) {
  try {
    const student = await getStudentById(parseInt(params.id));

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

    const student = await updateStudent(parseInt(params.id), studentInput);
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
    await deleteStudent(parseInt(params.id));
    return NextResponse.json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json(
      { error: "Failed to delete student" },
      { status: 500 }
    );
  }
}
