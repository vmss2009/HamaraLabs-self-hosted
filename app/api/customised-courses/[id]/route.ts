import { failure, success } from "@/lib/api/http";
import {
  getCustomisedCourseById,
  updateCustomisedCourse,
  deleteCustomisedCourse,
  getCustomisedCourses,
} from "@/lib/db/customised-course/crud";
import { CustomisedCourseCreateInput } from "@/lib/db/customised-course/type";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (id === "list") {
      const { searchParams } = new URL(request.url);
      const student_id = searchParams.get("student_id");

      if (!student_id) {
        return failure("Student ID is required", 400, { code: "MISSING_PARAM" });
      }

      const customisedCourses = await getCustomisedCourses({
        student_id: student_id,
      });
      return success(customisedCourses);
    }

    const customisedCourse = await getCustomisedCourseById(id);

    if (!customisedCourse) {
      return failure("Customised course not found", 404);
    }

    return success(customisedCourse);
  } catch (error) {
    console.error("Error fetching customised course:", error);
    return failure("Failed to fetch customised course", 500, {
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await request.json();

    if (!data.course_id || !data.student_id) {
      return failure("Missing required fields", 400, { code: "VALIDATION_ERROR" });
    }

    const customisedCourse = await updateCustomisedCourse(
      id,
      data as Partial<CustomisedCourseCreateInput>
    );

    return success(customisedCourse);
  } catch (error) {
    console.error("Error updating customised course:", error);
    return failure("Failed to update customised course", 500, {
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteCustomisedCourse(id);

    return success({
      message: "Customised course deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting customised course:", error);
    return failure("Failed to delete customised course", 500, {
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Allow partial updates: status, comments, attachments
    const patchData: any = {};
    if (Array.isArray(body.status)) {
      patchData.status = body.status;
    }
    if (typeof body.comments === 'string') {
      patchData.comments = body.comments;
    }
    if (Array.isArray(body.attachments)) {
      patchData.attachments = body.attachments;
    }

    if (Object.keys(patchData).length === 0) {
      return failure("No valid fields to update", 400, { code: "VALIDATION_ERROR" });
    }

    const updatedCourse = await updateCustomisedCourse(id, patchData);

    return success(updatedCourse);
  } catch (error) {
    console.error("Error updating customised course:", error);
    return failure("Failed to update customised course", 500, {
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
