import { NextResponse } from "next/server";
import {
  getTinkeringActivityById,
  updateTinkeringActivity,
  deleteTinkeringActivity,
} from "@/lib/db/tinkering-activity/crud";
import { tinkeringActivitySchema } from "@/lib/db/tinkering-activity/type";

export async function GET(request: Request, { params }: any) {
  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const activity = await getTinkeringActivityById(id);

    if (!activity) {
      return NextResponse.json(
        { error: "Tinkering activity not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(activity);
  } catch (error) {
    console.error("Error fetching tinkering activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch tinkering activity" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: any) {
  try {
    const id = params.id;
    const data = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }
    const result = tinkeringActivitySchema.safeParse(data);

    if (!result.success) {
      const errorMessages = result.error.errors.map((err) => err.message);
      console.error("Validation failed:", errorMessages);
      return NextResponse.json({ error: errorMessages[0] }, { status: 400 });
    }

    const validatedData = result.data;

    const activity = await updateTinkeringActivity(id, validatedData);
    return NextResponse.json(activity);
  } catch (error) {
    console.error("Error updating tinkering activity:", error);
    return NextResponse.json(
      { error: "Failed to update tinkering activity" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: any) {
  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    await deleteTinkeringActivity(id);
    return NextResponse.json({
      message: "Tinkering activity deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting tinkering activity:", error);
    return NextResponse.json(
      { error: "Failed to delete tinkering activity" },
      { status: 500 }
    );
  }
}
