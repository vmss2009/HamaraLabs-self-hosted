import { NextResponse } from "next/server";
import {
  createSchoolVisit,
  getSchoolVisits,
} from "@/lib/db/school-visits/crud";

import { z } from "zod";

export const schoolVisitSchema = z.object({
  school_id: z.string().uuid("Invalid school ID"),
  visit_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid visit date",
  }),
  poc_id: z.string().nullable().optional(),

  other_poc: z.string().optional(),
  uc_submissions: z.string().optional(),
  planned_showcase_date: z.string().optional(),
  school_performance: z.enum([
    "Good performing",
    "Medium performing",
    "Bad performing",
  ]),
  details: z.record(z.string(), z.string()), // assuming a key-value structure
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const school_id = searchParams.get("school_id");
    const visit_date = searchParams.get("visit_date");
    const poc_id = searchParams.get("poc_id");

    const filter = {
      school_id: school_id || undefined,
      visit_date: visit_date ? new Date(visit_date) : undefined,
      poc_id: poc_id || undefined,
    };

    const visits = await getSchoolVisits(filter);
    return NextResponse.json(visits);
  } catch (error) {
    console.error("Error fetching school visits:", error);
    return NextResponse.json(
      { error: "Failed to fetch school visits" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("school visits", body);

    const result = schoolVisitSchema.safeParse(body);

    if (!result.success) {
      const errorMessages = result.error.errors.map((err) => err.message);
      console.error("Validation failed:", errorMessages);
      return NextResponse.json({ error: errorMessages[0] }, { status: 400 });
    }

    const validatedData = result.data;

    const visit = await createSchoolVisit({
      school_id: validatedData.school_id,
      visit_date: new Date(validatedData.visit_date),
      poc_id:
        validatedData.poc_id === "other" ? null : validatedData.poc_id ?? null,
      other_poc: validatedData.other_poc,
      school_performance: validatedData.school_performance,
      details: validatedData.details,
    });

    return NextResponse.json(visit);
  } catch (error) {
    console.error("Error creating school visit:", error);
    return NextResponse.json(
      { error: "Failed to create school visit" },
      { status: 500 }
    );
  }
}
