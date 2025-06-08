import { NextResponse } from "next/server";
import { createCluster, getClusters } from "@/lib/db/cluster/crud";
import { ClusterCreateInput } from "@/lib/db/cluster/type/type";

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
    const cluster = await createCluster(data);
    return NextResponse.json(cluster);
  } catch (error) {
    console.error("Error creating cluster:", error);
    return NextResponse.json(
      { message: "Failed to create cluster" },
      { status: 500 }
    );
  }
} 