import { failure, success } from "@/lib/api/http";
import {
  getStudentById,
  updateStudent,
  deleteStudent,
} from "@/lib/db/student/crud";
import { StudentCreateInput, studentSchema  } from "@/lib/db/student/type";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const student = await getStudentById(id);

    if (!student) {
      return failure("Student not found", 404);
    }

    return success(student);
  } catch (error) {
    console.error("Error fetching student:", error);
    return failure("Failed to fetch student", 500, {
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const data = await request.json();

    const result = studentSchema.safeParse(data);

    if (!result.success) {
      const errorMessages = result.error.errors.map((err) => err.message);
      console.error("Validation failed:", errorMessages);
      return failure(errorMessages[0] ?? "Invalid data", 400, {
        code: "VALIDATION_ERROR",
        details: result.error.flatten(),
      });
    }

    const validatedData = result.data;
    const schoolId = validatedData.schoolId;
    if (!schoolId) {
      return failure("Invalid school ID", 400, { code: "INVALID_ID" });
    }

    const studentInput: StudentCreateInput = {
      first_name: validatedData.first_name,
      last_name: validatedData.last_name,
      aspiration: validatedData.aspiration,
      gender: validatedData.gender,
      email: validatedData.email,
      class: validatedData.class,
      section: validatedData.section,
      comments: validatedData.comments ?? "",
      schoolId: schoolId,
    };

    const { id } = await params;
    const student = await updateStudent(id, studentInput);
    return success(student);
  } catch (error) {
    console.error("Error updating student:", error);
    if (error instanceof Error) {
      return failure(error.message, 400, {
        details: error.message,
      });
    }
    return failure("Failed to update student", 500, {
      details: String(error),
    });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteStudent(id);
    return success({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    return failure("Failed to delete student", 500, {
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
