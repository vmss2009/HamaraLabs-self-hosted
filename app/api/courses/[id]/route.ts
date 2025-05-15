// app/api/courses/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get a single course by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const courseId = parseInt(params.id);

  try {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ message: "Course not found" }, { status: 404 });
    }

    return NextResponse.json(course, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching course:", error);
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}

// Update a course by ID
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const courseId = parseInt(params.id);

  try {
    const body = await req.json();

    const {
      name,
      description,
      organized_by,
      application_start_date,
      application_end_date,
      course_start_date,
      course_end_date,
      eligibility_from,
      eligibility_to,
      reference_link,
      requirements,
      course_tags,
    } = body;

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: {
        name,
        description,
        organized_by,
        application_start_date: new Date(application_start_date),
        application_end_date: new Date(application_end_date),
        course_start_date: new Date(course_start_date),
        course_end_date: new Date(course_end_date),
        eligibility_from,
        eligibility_to,
        reference_link,
        requirements: typeof requirements === 'string' ? requirements.split(',').map((r: string) => r.trim()) : requirements,
        course_tags: typeof course_tags === 'string' ? course_tags.split(',').map((t: string) => t.trim()) : course_tags,
      },
    });

    return NextResponse.json(updatedCourse, { status: 200 });
  } catch (error: any) {
    console.error("Error updating course:", error);
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}

// Delete a course by ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const courseId = parseInt(params.id);

  try {
    await prisma.course.delete({
      where: { id: courseId },
    });

    return NextResponse.json({ message: "Course deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting course:", error);
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}
