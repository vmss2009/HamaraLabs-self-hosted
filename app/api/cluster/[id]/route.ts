import { failure, success } from "@/lib/api/http";
import {
  getClusterById,
  updateCluster,
  deleteCluster,
} from "@/lib/db/cluster/crud";
import { clusterSchema } from "@/lib/db/cluster/type";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cluster = await getClusterById(id);
    if (!cluster) {
      return failure("Cluster not found", 404);
    }
    return success(cluster);
  } catch (error) {
    console.error("Error fetching cluster:", error);
    return failure("Failed to fetch cluster", 500, {
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
    const data = await request.json();

    const result = clusterSchema.safeParse(data);
    if (!result.success) {
      const errorMessages = result.error.errors.map((err) => err.message);
      console.error("Validation failed:", errorMessages);
      return failure(errorMessages[0] ?? "Invalid input", 400, {
        code: "VALIDATION_ERROR",
        details: result.error.flatten(),
      });
    }

    const validatedData = result.data;
    const updatedCluster = await updateCluster(id, validatedData);
    return success(updatedCluster);
  } catch (error) {
    console.error("Error Updating cluster:", error);

    if (error instanceof Error) {
      return failure(error.message, 500);
    }

    return failure("Failed to update cluster", 500);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteCluster(id);
    return success({ message: "Cluster deleted successfully" });
  } catch (error) {
    console.error("Error deleting cluster:", error);
    return failure("Failed to delete cluster", 500, {
      details: error instanceof Error ? error.message : String(error),
    });
  }
}
