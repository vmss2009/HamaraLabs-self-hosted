import { failure, success } from "@/lib/api/http";
import { createCustomisedCourse } from "@/lib/db/customised-course/crud";
import { CustomisedCourseCreateInput } from "@/lib/db/customised-course/type";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const requiredFields = ["id", "student_id", "status"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return failure(`Missing required field: ${field}`, 400, { code: "VALIDATION_ERROR" });
      }
    }

    const courseData: CustomisedCourseCreateInput = {
      course_id: body.id,
      student_id: body.student_id,
      status: Array.isArray(body.status) ? body.status : [body.status],
    };

    const customisedCourse = await createCustomisedCourse(courseData);
    return success(customisedCourse);
  } catch (error) {
    console.error("Error creating customised course:", error);
    return failure("Failed to create customised course", 500, {
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
