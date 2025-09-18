import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ email: string }> }
) {
  try {
    const { email } = await params;
    const user = await prisma.user.findUnique({ where: { email } });
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
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}