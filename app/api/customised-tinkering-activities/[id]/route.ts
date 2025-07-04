import { NextResponse } from "next/server";
import {
  getCustomisedTinkeringActivityById,
  updateCustomisedTinkeringActivity,
  deleteCustomisedTinkeringActivity,
  getCustomisedTinkeringActivities,
} from "@/lib/db/customised-tinkering-activity/crud";
import { z } from "zod";

export const customisedTinkeringActivitySchema = z.object({
  name: z.string().min(1, "Activity name is required"),
  subtopic_id: z
    .number()
    .int()
    .positive("Subtopic ID must be a positive number"),
  introduction: z.string().min(1, "Introduction is required"),
  goals: z.array(z.string()).optional().default([]),
  materials: z.array(z.string()).optional().default([]),
  instructions: z.array(z.string()).optional().default([]),
  tips: z.array(z.string()).optional().default([]),
  observations: z.array(z.string()).optional().default([]),
  extensions: z.array(z.string()).optional().default([]),
  resources: z.array(z.string()).optional().default([]),
  status: z.array(z.string()).optional().default([]),
});

export async function GET(request: Request, { params }: any) {
  try {
    if (params.id === "list") {
      const { searchParams } = new URL(request.url);
      const studentId = searchParams.get("student_id");

      if (!studentId) {
        return NextResponse.json(
          { error: "Student ID is required" },
          { status: 400 }
        );
      }

      const customisedTAs = await getCustomisedTinkeringActivities({
        student_id: studentId,
      });
      return NextResponse.json(customisedTAs);
    }

    const customisedTA = await getCustomisedTinkeringActivityById(params.id);

    if (!customisedTA) {
      return NextResponse.json(
        { error: "Customised tinkering activity not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(customisedTA);
  } catch (error) {
    console.error("Error fetching customised tinkering activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch customised tinkering activity" },
      { status: 500 }
    );
  }
}
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    const body = await request.json();

    const result = customisedTinkeringActivitySchema.safeParse(body);

    if (!result.success) {
      const errorMessages = result.error.errors.map((err) => err.message);
      console.error("Validation failed:", errorMessages);
      return NextResponse.json({ error: errorMessages[0] }, { status: 400 });
    }

    const validatedData = result.data;

    const updatedActivity = await updateCustomisedTinkeringActivity(
      id,
      validatedData
    );

    return NextResponse.json(updatedActivity);
  } catch (error) {
    console.error("Error updating customised tinkering activity:", error);
    return NextResponse.json(
      { error: "Failed to update customised tinkering activity" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: any) {
  try {
    const id = params.id;
    await deleteCustomisedTinkeringActivity(id);
    return NextResponse.json({
      message: "Customised tinkering activity deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting customised tinkering activity:", error);
    return NextResponse.json(
      { error: "Failed to delete customised tinkering activity" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request, { params }: any) {
  try {
    const id = params.id;
    const body = await request.json();

    const statusSchema = z.object({
      status: z.array(z.string()),
    });

    const result = statusSchema.safeParse(body);

    if (!result.success) {
      const errorMessages = result.error.errors.map((err) => err.message);
      console.error("Validation failed:", errorMessages);
      return NextResponse.json({ error: errorMessages[0] }, { status: 400 });
    }

    const updatedActivity = await updateCustomisedTinkeringActivity(id, {
      status: result.data.status,
    });

    return NextResponse.json(updatedActivity);
  } catch (error) {
    console.error("Error updating customised tinkering activity:", error);
    return NextResponse.json(
      { error: "Failed to update customised tinkering activity" },
      { status: 500 }
    );
  }
}
