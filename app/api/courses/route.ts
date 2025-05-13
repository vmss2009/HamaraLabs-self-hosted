// app/api/courses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
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

    const newCourse = await prisma.course.create({
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
        requirements,
        course_tags,
      },
    });

    return NextResponse.json(newCourse, { status: 201 });
  } catch (error: any) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
