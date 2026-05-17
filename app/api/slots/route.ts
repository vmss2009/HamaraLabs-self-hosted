import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const skip = Number(searchParams.get("skip") || 0);
  const take = Math.min(Number(searchParams.get("take") || 20), 100);
  try {
    const [data, total] = await Promise.all([
      prisma.slot.findMany({ skip, take, orderBy: { createdAt: "desc" } }),
      prisma.slot.count(),
    ]);
    return NextResponse.json({ data, total, skip, take });
  } catch {
    return NextResponse.json({ error: "Failed to fetch slots" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      merchantTransactionId,
      merchantId,
      email = "",
      phone,
      amount,
      status,
      items = [],
      paidBy = null,
      paymentMethod = null,
      notes = null,
    } = body || {};

    if (!merchantTransactionId || !merchantId || !phone || amount == null || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const created = await prisma.slot.create({
      data: {
        merchantTransactionId: String(merchantTransactionId),
        merchantId: String(merchantId),
        email: String(email ?? ""),
        phone: String(phone),
        amount: Number(amount),
        status: String(status),
        items: Array.isArray(items) ? items : [],
        paidBy: paidBy != null ? String(paidBy) : null,
        paymentMethod: paymentMethod != null ? String(paymentMethod) : null,
        notes: notes != null ? String(notes) : null,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e: unknown) {
    if ((e as { code?: string })?.code === "P2002") {
      return NextResponse.json({ error: "merchantTransactionId must be unique" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create slot" }, { status: 500 });
  }
}