import { NextResponse } from "next/server";
import { createCustomisedCourse } from "@/lib/db/customised-course/crud";
import { CustomisedCourseCreateInput } from "@/lib/db/customised-course/type";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ["course_id", "student_id", "status"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Prepare course data
    const courseData: CustomisedCourseCreateInput = {
      course_id: body.course_id,
      student_id: body.student_id,
      status: Array.isArray(body.status) ? body.status : [body.status],
    };

    const customisedCourse = await createCustomisedCourse(courseData);
    return NextResponse.json(customisedCourse);
  } catch (error) {
    console.error("Error creating customised course:", error);
    return NextResponse.json(
      { error: "Failed to create customised course" },
      { status: 500 }
    );
  }
}
