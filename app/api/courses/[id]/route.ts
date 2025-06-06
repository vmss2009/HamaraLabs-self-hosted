import { NextRequest, NextResponse } from "next/server";
import {
  getCourseById,
  updateCourse,
  deleteCourse,
} from "@/lib/db/course/crud";
import { CourseUpdateInput } from "@/lib/db/course/type";

export async function GET(req: NextRequest, { params }: any) {
  try {
    const courseId = parseInt(params.id);
    const course = await getCourseById(courseId);

    if (!course) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(course, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: any) {
  try {
    const courseId = parseInt(params.id);
    const body = await req.json();

    const updateData: CourseUpdateInput = {
      name: body.name,
      description: body.description,
      organized_by: body.organizedBy,
      application_start_date: new Date(body.application_start_date),
      application_end_date: new Date(body.application_end_date),
      course_start_date: new Date(body.course_start_date),
      course_end_date: new Date(body.course_end_date),
      eligibility_from: body.eligibility_from,
      eligibility_to: body.eligibility_to,
      reference_link: body.reference_link,
      requirements: Array.isArray(body.requirements)
        ? body.requirements
        : body.requirements.split(",").map((r: string) => r.trim()),
      course_tags: Array.isArray(body.course_tags)
        ? body.course_tags
        : body.course_tags.split(",").map((t: string) => t.trim()),
    };

    const updated = await updateCourse(courseId, updateData);
    return NextResponse.json(updated, { status: 200 });
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

export async function DELETE(req: NextRequest, { params }: any) {
  try {
    const courseId = parseInt(params.id);
    await deleteCourse(courseId);
    return NextResponse.json(
      { message: "Course deleted successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error deleting course:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
