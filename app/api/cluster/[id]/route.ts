import { NextResponse } from "next/server";
import {
  getClusterById,
  updateCluster,
  deleteCluster,
} from "@/lib/db/cluster/crud";
import { clusterSchema } from "@/lib/db/cluster/type";

export async function GET(
  request: Request,
  { params }: any
) {
  try {
    const id = params.id;
    const cluster = await getClusterById(id);
    if (!cluster) {
      return NextResponse.json(
        { message: "Cluster not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(cluster);
  } catch (error) {
    console.error("Error fetching cluster:", error);
    return NextResponse.json(
      { message: "Failed to fetch cluster" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: any
) {
  try {
    const id = params.id;
    const data = await request.json();

    const result = clusterSchema.safeParse(data);
    if (!result.success) {
      const errorMessages = result.error.errors.map((err) => err.message);
      console.error("Validation failed:", errorMessages);
      return NextResponse.json({ error: errorMessages[0] }, { status: 400 });
    }

    const validatedData = result.data;
    const updatedCluster = await updateCluster(id, validatedData);
    return NextResponse.json(updatedCluster);
  } catch (error) {
    console.error("Error Updating cluster:", error);

    if (error instanceof Error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: "Failed to create cluster" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: any
) {
  try {
    const id = params.id;
    await deleteCluster(id);
    return NextResponse.json({ message: "Cluster deleted successfully" });
  } catch (error) {
    console.error("Error deleting cluster:", error);
    return NextResponse.json(
      { message: "Failed to delete cluster" },
      { status: 500 }
    );
  }
}
