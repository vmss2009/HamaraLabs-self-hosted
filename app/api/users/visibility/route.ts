import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { isPublic } = await req.json();
    if (typeof isPublic !== "boolean") {
      return NextResponse.json({ error: "isPublic must be boolean" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { id: session.user.id } });
    const currentMeta = (existing?.user_meta_data || {}) as Record<string, unknown>;
    const newMeta = { ...currentMeta, isPublic };

    const user = await prisma.user.update({ where: { id: session.user.id }, data: { user_meta_data: newMeta } });
    return NextResponse.json({ id: user.id, email: user.email, isPublic: newMeta.isPublic });
  } catch (e) {
    console.error("Error updating visibility", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}