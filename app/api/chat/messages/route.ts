import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { listMessages, sendMessage } from '@/lib/chat/messages';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url, BASE_URL);
  const roomId = searchParams.get('roomId');
  const cursor = searchParams.get('cursor') || undefined;
  const takeRaw = searchParams.get('take');
  const take = takeRaw ? parseInt(takeRaw, 10) : undefined;
  if(!roomId) return NextResponse.json({ error: 'roomId required' }, { status: 400 });
  const data = await listMessages(roomId, cursor, take);
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const session = await auth();
  if(!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  const message = await sendMessage(body.roomId as string, session.user!.id, { 
    content: body.content as (string | undefined), 
    attachments: body.attachments as any, 
    type: body.type,
    replyToId: body.replyToId as (string | undefined)
  });
  return NextResponse.json({ message });
}