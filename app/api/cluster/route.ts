import { NextResponse } from "next/server";
import { createCluster, getClusters } from "@/lib/db/cluster/crud";
import { clusterSchema } from "@/lib/db/cluster/type";

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
