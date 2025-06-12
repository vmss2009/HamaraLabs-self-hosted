import { NextResponse } from "next/server";
import { createCluster, getClusters } from "@/lib/db/cluster/crud";
import { z } from "zod";

export const clusterSchema = z.object({
  name: z.string().min(1, "Cluster name is required"),
  hubs: z
    .array(
      z.object({
        hub_school_id: z.string().uuid("Invalid hub school ID"),
        spoke_school_ids: z
          .array(z.string().uuid("Invalid spoke school ID"))
          .min(1, "At least one spoke school ID is required"),
      })
    )
    .min(1, "At least one hub is required"),
});

export async function GET() {
  try {
    const clusters = await getClusters();
    return NextResponse.json(clusters);
  } catch (error) {
    console.error("Error fetching clusters:", error);
    return NextResponse.json(
      { message: "Failed to fetch clusters" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log("cluster data", data);

    const result = clusterSchema.safeParse(data);

    if (!result.success) {
      const errorMessages = result.error.errors.map((err) => err.message);
      console.error("Validation failed:", errorMessages);
      return NextResponse.json({ error: errorMessages[0] }, { status: 400 });
    }

    const validatedData = result.data;

    const cluster = await createCluster(validatedData);
    return NextResponse.json(cluster);
  } catch (error) {
    console.error("Error creating cluster:", error);

    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: "Failed to create cluster" },
      { status: 500 }
    );
  }
}
