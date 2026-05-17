import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { listRooms, createRoom } from '@/lib/chat/rooms';

export async function GET() {
  const session = await auth();
  if(!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const rooms = await listRooms(session.user!.id);
  return NextResponse.json({ rooms });
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if(!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const { room, missingMembers } = await createRoom(session.user!.id, body.name as string, (body.memberIds as string[]) || []);
    return NextResponse.json({ room, missingMembers });
  } catch (e: any) {
    if (e.code === 'P2025') {
      return NextResponse.json({ error: 'One or more member IDs do not exist', detail: e.meta }, { status: 400 });
    }
    return NextResponse.json({ error: e.message || 'Failed to create room' }, { status: 500 });
  }
}