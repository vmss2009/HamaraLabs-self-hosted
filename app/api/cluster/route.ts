import { failure, success } from "@/lib/api/http";
import { createCluster, getClusters } from "@/lib/db/cluster/crud";
import { clusterSchema } from "@/lib/db/cluster/type";

export async function GET() {
  try {
    const clusters = await getClusters();
    return success(clusters);
  } catch (error) {
    console.error("Error fetching clusters:", error);
    return failure("Failed to fetch clusters", 500, {
      details: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const result = clusterSchema.safeParse(data);

    if (!result.success) {
      const errorMessages = result.error.errors.map((err) => err.message);
      console.error("Validation failed:", errorMessages);
      return failure(errorMessages[0] ?? "Invalid data", 400, {
        code: "VALIDATION_ERROR",
        details: result.error.flatten(),
      });
    }

    const validatedData = result.data;

    const cluster = await createCluster(validatedData);
    return success(cluster);
  } catch (error) {
    console.error("Error creating cluster:", error);

    if (error instanceof Error) {
      return failure(error.message, 500);
    }

    return failure("Failed to create cluster", 500);
  }
}
