import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const users = await prisma.user.findMany({ select: { id: true, email: true, user_meta_data: true } });
    return NextResponse.json({ users });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Failed to fetch users' }, { status: 500 });
  }
}