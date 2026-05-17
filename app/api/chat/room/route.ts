import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { getRoomWithMembers, updateRoomMembers, updateRoomName, deleteRoom } from '@/lib/chat/rooms';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url, BASE_URL);
  const roomId = searchParams.get('roomId');
  if (!roomId) return NextResponse.json({ error: 'roomId required' }, { status: 400 });
  const room = await getRoomWithMembers(roomId);
  if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  const me = session?.user?.id;
  const isMember = !!me && room.members.some(m => m.id === me);
  if (!isMember) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  return NextResponse.json({ room });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const roomId = body.roomId as string;
  if (!roomId) return NextResponse.json({ error: 'roomId required' }, { status: 400 });

  const current = await getRoomWithMembers(roomId);
  if (!current) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  const isMember = !!session?.user?.id && current.members.some(m => m.id === session.user!.id);
  if (!isMember) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // If a name is provided, this is a rename request (admin-only enforced in lib)
  if (typeof body.name === 'string') {
    try {
      const updated = await updateRoomName(roomId, session.user.id, body.name);
      return NextResponse.json({ room: updated });
    } catch (e: any) {
      const message = e.message || 'Failed to rename room';
      const status = message.includes('Forbidden') ? 403 : (message.includes('not found') ? 404 : 400);
      return NextResponse.json({ error: message }, { status });
    }
  }

  // Otherwise, treat it as member updates (admin-only enforced in lib)
  const addIds = Array.isArray(body.addIds) ? body.addIds : [];
  const removeIds = Array.isArray(body.removeIds) ? body.removeIds : [];
  try {
    const updated = await updateRoomMembers(roomId, addIds, removeIds, session.user.id);
    return NextResponse.json({ room: updated });
  } catch (e: any) {
    const message = e.message || 'Failed to update members';
    const status = message.includes('Forbidden') ? 403 : (message.includes('not found') ? 404 : 400);
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url, BASE_URL);
  const roomId = searchParams.get('roomId');
  if (!roomId) return NextResponse.json({ error: 'roomId required' }, { status: 400 });
  try {
    await deleteRoom(roomId, session.user.id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const message = e.message || 'Failed to delete room';
    const status = message.includes('Forbidden') ? 403 : (message.includes('not found') ? 404 : 400);
    return NextResponse.json({ error: message }, { status });
  }
}
