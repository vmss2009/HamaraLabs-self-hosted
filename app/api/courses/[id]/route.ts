import { failure, success } from "@/lib/api/http";
import { NextRequest } from "next/server";
import {
  getCourseById,
  updateCourse,
  deleteCourse,
} from "@/lib/db/course/crud";
import { CourseUpdateInput, courseSchema } from "@/lib/db/course/type";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: courseId } = await params;
    const course = await getCourseById(courseId);

    if (!course) {
      return failure("Course not found", 404);
    }

    return success(course, 200);
  } catch (error: unknown) {
    console.error("Error fetching course:", error);
    return failure(
      "Internal Server Error",
      500,
      { details: error instanceof Error ? error.message : String(error) }
    );
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: courseId } = await params;
    if (!courseId) {
      return failure("Invalid course ID", 400, { code: "INVALID_ID" });
    }

    const body = await req.json();

    const updateData: CourseUpdateInput = {
      name: body.name,
      description: body.description,
      organised_by: body.organisedBy,
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

    const result = courseSchema.safeParse(updateData);
    if (!result.success) {
      const errorMessages = result.error.errors.map((err) => err.message);
      console.error("Validation failed:", errorMessages);
      return failure(errorMessages[0] ?? "Invalid data", 400, {
        code: "VALIDATION_ERROR",
        details: result.error.flatten(),
      });
    }

    const updated = await updateCourse(courseId, result.data);
    return success(updated, 200);
  } catch (error) {
    console.error("Error updating course:", error);
    return failure(
      error instanceof Error ? error.message : "Failed to update course",
      400
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: courseId } = await params;
    await deleteCourse(courseId);
    return success({ message: "Course deleted successfully" }, 200);
  } catch (error: unknown) {
    console.error("Error deleting course:", error);
    return failure(
      "Internal Server Error",
      500,
      { details: error instanceof Error ? error.message : String(error) }
    );
  }
}
