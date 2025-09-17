import { failure, success } from "@/lib/api/http";
import { createMentor, getMentors } from "@/lib/db/mentor/crud";
import { mentorSchema } from "@/lib/db/mentor/type";

// Transform function to convert user_roles back to schools for frontend compatibility
function transformMentorData(mentor: any) {
  return {
    ...mentor,
    schools: mentor.user_roles?.map((role: any) => role.school) || []
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = {
      name: searchParams.get("name") || undefined,
      email: searchParams.get("email") || undefined,
      schoolId: searchParams.get("schoolId") || undefined,
    };

    const mentors = await getMentors(filter);
    const transformedMentors = mentors.map(transformMentorData);
    return success(transformedMentors);
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

    const mentor = await createMentor(validatedData);
    const transformedMentor = transformMentorData(mentor);
    return success(transformedMentor, 201);
  } catch (error) {
    console.error("Error creating mentor:", error);
    if (error instanceof Error) {
      return failure(error.message, 400);
    }
    return failure("Failed to create mentor", 500);
  }
}
