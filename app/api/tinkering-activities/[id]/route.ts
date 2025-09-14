import { failure, success } from "@/lib/api/http";
import {
  getTinkeringActivityById,
  updateTinkeringActivity,
  deleteTinkeringActivity,
} from "@/lib/db/tinkering-activity/crud";
import { tinkeringActivitySchema } from "@/lib/db/tinkering-activity/type";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;

    if (!id) {
      return failure("Invalid ID format", 400, { code: "INVALID_ID" });
    }

    const activity = await getTinkeringActivityById(id);

    if (!activity) {
      return failure("Tinkering activity not found", 404);
    }

    return success(activity);
  } catch (error) {
    console.error("Error fetching tinkering activity:", error);
    return failure("Failed to fetch tinkering activity", 500, {
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const data = await request.json();

    if (!id) {
      return failure("Invalid ID format", 400, { code: "INVALID_ID" });
    }
    const result = tinkeringActivitySchema.safeParse(data);

    if (!result.success) {
      const errorMessages = result.error.errors.map((err) => err.message);
      console.error("Validation failed:", errorMessages);
      return failure(errorMessages[0] ?? "Invalid data", 400, {
        code: "VALIDATION_ERROR",
        details: result.error.flatten(),
      });
    }

    const validatedData = result.data;

    const payload = { ...validatedData, type: "default" } as const;

    const activity = await updateTinkeringActivity(id, payload);
    return success(activity);
  } catch (error) {
    console.error("Error updating tinkering activity:", error);
    return failure("Failed to update tinkering activity", 500, {
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;

    if (!id) {
      return failure("Invalid ID format", 400, { code: "INVALID_ID" });
    }

    await deleteTinkeringActivity(id);
    return success({
      message: "Tinkering activity deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting tinkering activity:", error);
    return failure("Failed to delete tinkering activity", 500, {
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
