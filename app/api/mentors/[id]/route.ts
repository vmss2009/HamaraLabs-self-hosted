import { failure, success } from "@/lib/api/http";
import {
  getMentorById,
  updateMentor,
  deleteMentor,
} from "@/lib/db/mentor/crud";
import { MentorUpdateInput, mentorSchema } from "@/lib/db/mentor/type";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const mentor = await getMentorById(id);
    if (!mentor) {
      return failure("Mentor not found", 404);
    }
    return success(mentor);
  } catch (error) {
    console.error("Error fetching mentor:", error);
    return failure("Failed to fetch mentor", 500, {
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updateData: MentorUpdateInput = {
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      phone_number: body.phone_number,
      school_ids: body.school_ids,
      comments: body.comments,
    };
    const result = mentorSchema.partial().safeParse(updateData);
    if (!result.success) {
      const errorMessages = result.error.errors.map((err) => err.message);
      console.error("Validation failed:", errorMessages);
      return failure(errorMessages[0] ?? "Invalid data", 400, {
        code: "VALIDATION_ERROR",
        details: result.error.flatten(),
      });
    }

    const mentor = await updateMentor(id, result.data);
    return success(mentor);
  } catch (error) {
    console.error("Error updating mentor:", error);
    if (error instanceof Error) {
      return failure(error.message, 400);
    }
    return failure("Failed to update mentor", 500);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteMentor(id);
    return success({ message: "Mentor deleted successfully" });
  } catch (error) {
    console.error("Error deleting mentor:", error);
    return failure("Failed to delete mentor", 500, {
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
