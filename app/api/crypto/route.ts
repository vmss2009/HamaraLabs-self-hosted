import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const randomUUID = crypto.randomUUID();
    return NextResponse.json({ success: true, data: { randomUUID } });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}