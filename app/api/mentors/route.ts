import { failure, success } from "@/lib/api/http";
import { createMentor, getMentors } from "@/lib/db/mentor/crud";
import { mentorSchema, MentorCreateInput } from "@/lib/db/mentor/type";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = {
      name: searchParams.get("name") || undefined,
      email: searchParams.get("email") || undefined,
      schoolId: searchParams.get("schoolId") || undefined,
    };

    const mentors = await getMentors(filter);
    return success(mentors);
  } catch (error) {
    console.error("Error fetching mentors:", error);
    return failure("Failed to fetch mentors", 500, {
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = mentorSchema.safeParse(body);

    if (!result.success) {
      const errorMessages = result.error.errors.map((err) => err.message);
      console.error("Validation failed:", errorMessages);
      return failure(errorMessages[0] ?? "Invalid data", 400, {
        code: "VALIDATION_ERROR",
        details: result.error.flatten(),
      });
    }

    const validatedData = result.data;

    const mentorInput: MentorCreateInput = {
      first_name: validatedData.first_name,
      last_name: validatedData.last_name,
      email: validatedData.email,
      phone_number: validatedData.phone_number,
      school_ids: validatedData.school_ids,
      comments: validatedData.comments,
    };

    const mentor = await createMentor(mentorInput);
    return success(mentor, 201);
  } catch (error) {
    console.error("Error creating mentor:", error);
    if (error instanceof Error) {
      return failure(error.message, 400);
    }
    return failure("Failed to create mentor", 500);
  }
}
