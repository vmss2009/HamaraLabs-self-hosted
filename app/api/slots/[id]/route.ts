import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const slot = await prisma.slot.findUnique({ where: { id } });
    if (!slot) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(slot);
  } catch {
    return NextResponse.json({ error: "Failed to fetch slot" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const body = await req.json();

    const data: Record<string, unknown> = {};
    if (body.merchantTransactionId !== undefined) data.merchantTransactionId = String(body.merchantTransactionId);
    if (body.merchantId !== undefined) data.merchantId = String(body.merchantId);
    if (body.email !== undefined) data.email = String(body.email ?? "");
    if (body.phone !== undefined) data.phone = String(body.phone);
    if (body.amount !== undefined) data.amount = Number(body.amount);
    if (body.status !== undefined) data.status = String(body.status);
    if (body.items !== undefined) data.items = Array.isArray(body.items) ? body.items : [];
    if (body.paidBy !== undefined) data.paidBy = body.paidBy != null ? String(body.paidBy) : null;
    if (body.paymentMethod !== undefined) data.paymentMethod = body.paymentMethod != null ? String(body.paymentMethod) : null;
    if (body.notes !== undefined) data.notes = body.notes != null ? String(body.notes) : null;

    const updated = await prisma.slot.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (e: unknown) {
    if ((e as { code?: string })?.code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to update slot" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const count = await prisma.booking.count({ where: { slotId: id } });
    if (count > 0) return NextResponse.json({ error: "Slot has bookings" }, { status: 409 });

    const deleted = await prisma.slot.delete({ where: { id } });
    return NextResponse.json(deleted);
  } catch (e: unknown) {
    if ((e as { code?: string })?.code === "P2025") {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Failed to delete slot" }, { status: 500 });
  }
}