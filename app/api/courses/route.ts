// app/api/courses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createCourse, getCourses } from "@/lib/db/course/crud";
import { CourseCreateInput } from "@/lib/db/course/type";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    body.organized_by = body.organized_by;

    // Required fields
    const requiredFields = [
      "name",
      "description",
      "organized_by",
      "application_start_date",
      "application_end_date",
      "course_start_date",
      "course_end_date",
      "eligibility_from",
      "eligibility_to",
      "reference_link",
      "requirements",
      "course_tags"
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Prepare course data
    const courseData: CourseCreateInput = {
      name: body.name,
      description: body.description,
      organized_by: body.organized_by,
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

    console.log("Sending course data:", JSON.stringify(courseData, null, 2));

    const course = await createCourse(courseData);
    return NextResponse.json(course, { status: 201 });
  } catch (error: any) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const courses = await getCourses();
    return NextResponse.json(courses, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
