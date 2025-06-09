import { NextRequest, NextResponse } from "next/server";
import { createCourse, getCourses } from "@/lib/db/course/crud";
import { CourseCreateInput } from "@/lib/db/course/type";
import { z } from "zod";

export const courseSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().min(1, "Description is required"),
  organized_by: z.string().trim().min(1, "Organized by is required"),
  application_start_date: z.coerce.date(),
  application_end_date: z.coerce.date(),
  course_start_date: z.coerce.date(),
  course_end_date: z.coerce.date(),
  eligibility_from: z.string().trim().min(1, "Eligibility from is required"),
  eligibility_to: z.string().trim().min(1, "Eligibility to is required"),
  reference_link: z
    .string()
    .trim()
    .url("Reference link must be a valid URL")
    .optional()
    .or(z.literal("")),

  requirements: z.array(z.string().trim()).optional().default([]),

  course_tags: z.array(z.string().trim()).optional().default([]),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    body.organized_by = body.organized_by;

    const requiredFields = [
      "name",
      "description",
      "organized_by",
      "application_start_date",
      "application_end_date",
      "course_start_date",
      "course_end_date",
      "eligibility_from",
      "eligibility_to",
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const courseData: CourseCreateInput = {
      name: body.name,
      description: body.description,
      organized_by: body.organized_by,
      application_start_date: new Date(body.application_start_date),
      application_end_date: new Date(body.application_end_date),
      course_start_date: new Date(body.course_start_date),
      course_end_date: new Date(body.course_end_date),
      eligibility_from: body.eligibility_from,
      eligibility_to: body.eligibility_to,
      reference_link: body.reference_link,
      requirements: Array.isArray(body.requirements)
        ? body.requirements
        : body.requirements.split(",").map((r: string) => r.trim()),
      course_tags: Array.isArray(body.course_tags)
        ? body.course_tags
        : body.course_tags.split(",").map((t: string) => t.trim()),
    };

    console.log("Sending course data:", JSON.stringify(courseData, null, 2));

    const result = courseSchema.safeParse(courseData);
    if (!result.success) {
      const errorMessages = result.error.errors.map((err) => err.message);
      console.error("Validation failed:", errorMessages);
      return NextResponse.json({ error: errorMessages[0] }, { status: 400 });
    }

    const course = await createCourse(result.data);
    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create course",
      },
      { status: 400 }
    );
  }
}

export async function GET() {
  try {
    const courses = await getCourses();
    return NextResponse.json(courses, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { message: "Internal Server Error", error: error.message },
      { status: 500 }
    );
  }
}
