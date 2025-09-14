import { failure, success } from "@/lib/api/http";
import {
  createStudent,
  getStudents,
  getStudentById,
} from "@/lib/db/student/crud";
import { StudentCreateInput, studentSchema } from "@/lib/db/student/type";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const student = await getStudentById(id);
      if (!student) {
        return failure("Student not found", 404);
      }
      return success(student);
    }

    const filter = {
      first_name: searchParams.get("first_name") || undefined,
      last_name: searchParams.get("last_name") || undefined,
      gender: searchParams.get("gender") || undefined,
      class: searchParams.get("class") || undefined,
      section: searchParams.get("section") || undefined,
      schoolId: searchParams.get("schoolId") || undefined,
    };

    const students = await getStudents(filter);
    return success(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    return failure("Failed to fetch students", 500, {
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function POST(request: Request) {
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

    const studentInput: StudentCreateInput = {
      first_name: validatedData.first_name,
      last_name: validatedData.last_name,
      aspiration: validatedData.aspiration,
      gender: validatedData.gender,
      email: validatedData.email,
      class: validatedData.class,
      section: validatedData.section,
      comments: validatedData.comments ?? "",
      schoolId: validatedData.schoolId,
    };

    const student = await createStudent(studentInput);
    return success(student, 201);
  } catch (error) {
    console.error("Error creating student:", error);
    return failure(
      error instanceof Error ? error.message : "Failed to create student",
      400
    );
  }
}
