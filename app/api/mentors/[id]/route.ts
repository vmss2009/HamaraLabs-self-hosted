import { failure, success } from "@/lib/api/http";
import {
  getMentorById,
  updateMentor,
  deleteMentor,
} from "@/lib/db/mentor/crud";
import { MentorUpdateInput, mentorSchema } from "@/lib/db/mentor/type";

// Transform function to convert user_roles back to schools for frontend compatibility
function transformMentorData(mentor: any) {
  return {
    ...mentor,
    schools: mentor.user_roles?.map((role: any) => role.school) || []
  };
}

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const mentor = await getMentorById(params.id);
    if (!mentor) {
      return failure("Mentor not found", 404);
    }
    const transformedMentor = transformMentorData(mentor);
    return success(transformedMentor);
  } catch (error) {
    console.error("Error fetching mentor:", error);
    return failure("Failed to fetch mentor", 500, {
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const updateData: MentorUpdateInput = {
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      user_meta_data: body.user_meta_data,
      school_ids: body.school_ids,
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

    const mentor = await updateMentor(params.id, result.data);
    const transformedMentor = transformMentorData(mentor);
    return success(transformedMentor);
  } catch (error) {
    console.error("Error updating mentor:", error);
    if (error instanceof Error) {
      return failure(error.message, 400);
    }
    return failure("Failed to update mentor", 500);
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    await deleteMentor(params.id);
    return success({ message: "Mentor deleted successfully" });
  } catch (error) {
    console.error("Error deleting mentor:", error);
    return failure("Failed to delete mentor", 500, {
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
