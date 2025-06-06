import { NextResponse } from "next/server";
import { getCustomisedCourseById, updateCustomisedCourse, deleteCustomisedCourse, getCustomisedCourses } from "@/lib/db/customised-course/crud";
import { CustomisedCourseCreateInput } from "@/lib/db/customised-course/type";

export async function GET(request: Request, { params }: any) {
  try {
    if (params.id === "list") {
      const { searchParams } = new URL(request.url);
      const student_id = searchParams.get("student_id");

      if (!student_id) {
        return NextResponse.json(
          { error: "Student ID is required" },
          { status: 400 },
        );
      }

      const customisedCourses = await getCustomisedCourses({
        student_id: parseInt(student_id),
      });
      return NextResponse.json(customisedCourses);
    }

    const customisedCourse = await getCustomisedCourseById(parseInt(params.id));

    if (!customisedCourse) {
      return NextResponse.json(
        { error: "Customised course not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(customisedCourse);
  } catch (error) {
    console.error("Error fetching customised course:", error);
    return NextResponse.json(
      { error: "Failed to fetch customised course" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, { params }: any) {
  try {
    const id = parseInt(params.id);
    const data = await request.json();

    if (!data.course_id || !data.student_id) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const customisedCourse = await updateCustomisedCourse(
      id,
      data as Partial<CustomisedCourseCreateInput>,
    );

    return NextResponse.json(customisedCourse);
  } catch (error) {
    console.error("Error updating customised course:", error);
    return NextResponse.json(
      { error: "Failed to update customised course" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request, { params }: any) {
  try {
    const id = parseInt(params.id);
    await deleteCustomisedCourse(id);

    return NextResponse.json({
      message: "Customised course deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting customised course:", error);
    return NextResponse.json(
      { error: "Failed to delete customised course" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, { params }: any) {
  try {
    const id = parseInt(params.id, 10);
    const body = await request.json();

    if (!body.status || !Array.isArray(body.status)) {
      return NextResponse.json(
        { error: "Status must be an array" },
        { status: 400 },
      );
    }

    const updatedCourse = await updateCustomisedCourse(id, {
      status: body.status,
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error("Error updating customised course:", error);
    return NextResponse.json(
      { error: "Failed to update customised course" },
      { status: 500 },
    );
  }
}
