import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const metadata = user?.user_meta_data as Record<string, unknown> | null;
    const isPublic = (metadata && typeof (metadata as any).isPublic === 'boolean') ? (metadata as any).isPublic : true;
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.first_name ? `${user.first_name}${user.last_name ? ' ' + user.last_name : ''}` : undefined,
      isPublic,
      priority: (user as any).priority ?? 3,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Update only allowed fields
    const updateData: any = {};
    
    if (typeof body.priority === 'number' && body.priority >= 1 && body.priority <= 5) {
      updateData.priority = body.priority;
    }
    
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }
    
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
    });
    
    return NextResponse.json({
      id: updatedUser.id,
      priority: (updatedUser as any).priority ?? 3,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}