import { NextResponse } from "next/server";
import { createStudent, getStudents, getStudentById } from "@/lib/db/student/crud";
import { StudentCreateInput } from "@/lib/db/student/type";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

// Corrected schema: schoolId is string
export const studentSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required"),
  last_name: z.string().trim().min(1, "Last name is required"),
  aspiration: z.string().trim().min(1, "Aspiration is required"),
  gender: z
    .string()
    .transform((val) => val.toLowerCase())
    .pipe(z.enum(["male", "female", "other"])),
  email: z.string().email("Invalid email address"),
  class: z.string().trim().min(1, "Class is required"),
  section: z.string().trim().min(1, "Section is required"),
  comments: z.string().trim().optional().nullable(),
  schoolId: z.string().uuid("schoolId must be a valid UUID"),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    // If ID is provided, return a single student
    if (id) {
      const student = await getStudentById(id);
      if (!student) {
        return NextResponse.json(
          { error: "Student not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(student);
    }

    // Get the current user's session
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "No authenticated user found" },
        { status: 401 }
      );
    }

    // Get the user with their associated schools
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { schools: { select: { id: true } } }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get the IDs of schools associated with the user
    const userSchoolIds = user.schools.map(school => school.id.toString());
    
    // Build filter object from query parameters
    const filter = {
      first_name: searchParams.get('first_name') || undefined,
      last_name: searchParams.get('last_name') || undefined,
      gender: searchParams.get('gender') || undefined,
      class: searchParams.get('class') || undefined,
      section: searchParams.get('section') || undefined,
      school_id: searchParams.get('schoolId') ? parseInt(searchParams.get('schoolId') as string) : undefined,
      userSchoolIds // Add the user's school IDs to the filter
    };
    
    const students = await getStudents(filter);
    return NextResponse.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const result = studentSchema.safeParse(data);

    if (!result.success) {
      const errorMessages = result.error.errors.map((err) => err.message);
      console.error("Validation failed:", errorMessages);
      return NextResponse.json({ error: errorMessages[0] }, { status: 400 });
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
      schoolId: validatedData.schoolId, // Already string
    };

    const student = await createStudent(studentInput);
    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    console.error("Error creating student:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create student",
      },
      { status: 400 }
    );
  }
}