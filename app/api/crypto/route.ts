import { NextResponse } from 'next/server';
import { requireApiAccess } from "@/lib/authz/guard";

export async function GET(request: Request) {
  const denied = await requireApiAccess(request);
  if (denied) return denied;

  try {
    const randomUUID = crypto.randomUUID();
    return NextResponse.json({ success: true, data: { randomUUID } });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}