import { failure, success } from "@/lib/api/http";
import {
  getCustomisedTinkeringActivityById,
  updateCustomisedTinkeringActivity,
  deleteCustomisedTinkeringActivity,
  getCustomisedTinkeringActivities,
} from "@/lib/db/customised-tinkering-activity/crud";
import { customisedTinkeringActivitySchema, statusSchema } from "@/lib/db/customised-tinkering-activity/type";
import { auth } from "@/lib/auth/auth";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (id === "list") {
      const { searchParams } = new URL(request.url);
      const studentId = searchParams.get("student_id");

      if (!studentId) {
        return failure("Student ID is required", 400, { code: "MISSING_PARAM" });
      }

      const customisedTAs = await getCustomisedTinkeringActivities({
        student_id: studentId,
      });
      return success(customisedTAs);
    }

    const customisedTA = await getCustomisedTinkeringActivityById(id);

    if (!customisedTA) {
      return failure("Customised tinkering activity not found", 404);
    }

    return success(customisedTA);
  } catch (error) {
    console.error("Error fetching customised tinkering activity:", error);
    return failure("Failed to fetch customised tinkering activity", 500, {
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await request.json();

    const result = customisedTinkeringActivitySchema.safeParse(body);

    if (!result.success) {
      const errorMessages = result.error.errors.map((err) => err.message);
      console.error("Validation failed:", errorMessages);
      return failure(errorMessages[0] ?? "Invalid data", 400, {
        code: "VALIDATION_ERROR",
        details: result.error.flatten(),
      });
    }

    const validatedData = result.data;

    const session = await auth();
    const userId = session?.user?.id ?? null;

    const updatedActivity = await updateCustomisedTinkeringActivity(
      id,
      {
        ...validatedData,
        keepSnapshotAttachmentUrls: Array.isArray((body as any)?.keepSnapshotAttachmentUrls)
          ? (body as any).keepSnapshotAttachmentUrls as string[]
          : [],
      },
      userId
    );

    return success(updatedActivity);
  } catch (error) {
    console.error("Error updating customised tinkering activity:", error);
    return failure("Failed to update customised tinkering activity", 500, {
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteCustomisedTinkeringActivity(id);
    return success({
      message: "Customised tinkering activity deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting customised tinkering activity:", error);
    return failure("Failed to delete customised tinkering activity", 500, {
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const result = statusSchema.safeParse(body);

    if (!result.success) {
      const errorMessages = result.error.errors.map((err) => err.message);
      console.error("Validation failed:", errorMessages);
      return failure(errorMessages[0] ?? "Invalid data", 400, {
        code: "VALIDATION_ERROR",
        details: result.error.flatten(),
      });
    }

    const session = await auth();
    const userId = session?.user?.id ?? null;

    const updatedActivity = await updateCustomisedTinkeringActivity(id, {
      status: result.data.status,
    }, userId);

    return success(updatedActivity);
  } catch (error) {
    console.error("Error updating customised tinkering activity:", error);
    return failure("Failed to update customised tinkering activity", 500, {
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
