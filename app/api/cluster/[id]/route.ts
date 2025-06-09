import { NextResponse } from "next/server";
import { getClusterById, updateCluster, deleteCluster } from "@/lib/db/cluster/crud";

// Handle GET request to fetch a single cluster by ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const cluster = await getClusterById(id);
    if (!cluster) {
      return NextResponse.json({ message: "Cluster not found" }, { status: 404 });
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

// Handle PUT request to update a cluster by ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const data = await request.json();
    // You might want to add validation for the incoming data here
    const updatedCluster = await updateCluster(id, data);
    return NextResponse.json(updatedCluster);
  } catch (error) {
    console.error("Error updating cluster:", error);
    return NextResponse.json(
      { message: "Failed to update cluster" },
      { status: 500 }
    );
  }
}

// Handle DELETE request to delete a cluster by ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
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