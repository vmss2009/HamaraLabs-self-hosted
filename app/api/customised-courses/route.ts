import { NextResponse } from "next/server";
import { createCustomisedCourse } from "@/lib/db/customised-course/crud";
import { CustomisedCourseCreateInput } from "@/lib/db/customised-course/type";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log("customized course Bodyy", body);

    const requiredFields = ["id", "student_id", "status"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const courseData: CustomisedCourseCreateInput = {
      course_id: Number(body.id),
      student_id: Number(body.student_id),
      status: Array.isArray(body.status) ? body.status : [body.status],
    };
    console.log("coursedata", courseData);

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
