import { NextResponse } from "next/server";
import { createMentor, getMentors } from "@/lib/db/mentor/crud";

import { z } from "zod";

export const mentorSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  user_meta_data: z
    .object({
      phone_number: z.string().optional(),
    })
    .optional(),
  school_ids: z
    .array(z.string().uuid("Invalid school ID"))
    .min(1, "At least one school ID is required"),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = {
      name: searchParams.get("name") || undefined,
      email: searchParams.get("email") || undefined,
      schoolId: searchParams.get("schoolId") || undefined,
    };

    const mentors = await getMentors(filter);
    return NextResponse.json(mentors);
  } catch (error) {
    console.error("Error fetching mentors:", error);
    return NextResponse.json(
      { error: "Failed to fetch mentors" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const result = mentorSchema.safeParse(body);

    if (!result.success) {
      const errorMessages = result.error.errors.map((err) => err.message);
      console.error("Validation failed:", errorMessages);
      return NextResponse.json({ error: errorMessages[0] }, { status: 400 });
    }

    const validatedData = result.data;

    const mentor = await createMentor(validatedData);
    return NextResponse.json(mentor, { status: 201 });
  } catch (error) {
    console.error("Error creating mentor:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to create mentor" },
      { status: 500 }
    );
  }
}
