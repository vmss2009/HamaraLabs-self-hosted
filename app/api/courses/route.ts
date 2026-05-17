import { failure, success } from "@/lib/api/http";
import { NextRequest } from "next/server";
import { createCourse, getCourses } from "@/lib/db/course/crud";
import { CourseCreateInput, courseSchema } from "@/lib/db/course/type";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const requiredFields = [
      "name",
      "description",
      "organised_by",
      "application_start_date",
      "application_end_date",
      "course_start_date",
      "course_end_date",
      "eligibility_from",
      "eligibility_to",
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return failure(`Missing required field: ${field}`, 400, { code: "VALIDATION_ERROR" });
      }
    }

    const courseData: CourseCreateInput = {
      name: body.name,
      description: body.description,
      organised_by: body.organised_by,
      application_start_date: new Date(body.application_start_date),
      application_end_date: new Date(body.application_end_date),
      course_start_date: new Date(body.course_start_date),
      course_end_date: new Date(body.course_end_date),
      eligibility_from: body.eligibility_from,
      eligibility_to: body.eligibility_to,
      reference_link: body.reference_link,
      requirements: Array.isArray(body.requirements)
        ? body.requirements
        : String(body.requirements).split(",").map((r: string) => r.trim()),
      course_tags: Array.isArray(body.course_tags)
        ? body.course_tags
        : String(body.course_tags).split(",").map((t: string) => t.trim()),
    };

    const result = courseSchema.safeParse(courseData);
    if (!result.success) {
      const errorMessages = result.error.errors.map((err) => err.message);
      console.error("Validation failed:", errorMessages);
      return failure(errorMessages[0] ?? "Invalid data", 400, {
        code: "VALIDATION_ERROR",
        details: result.error.flatten(),
      });
    }

    const course = await createCourse(result.data);
    return success(course, 201);
  } catch (error) {
    console.error("Error creating course:", error);
    return failure(
      error instanceof Error ? error.message : "Failed to create course",
      400
    );
  }
}

export async function GET() {
  try {
    const courses = await getCourses();
    return success(courses, 200);
  } catch (error: unknown) {
    console.error("Error fetching courses:", error);
    return failure(
      "Internal Server Error",
      500,
      { details: error instanceof Error ? error.message : String(error) }
    );
  }
}
