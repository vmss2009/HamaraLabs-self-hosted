import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { updateMessage, deleteMessage } from '@/lib/chat/messages';

export async function PATCH(req: Request) {
  const session = await auth();
  if(!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, content } = await req.json() as { id: string; content: string };
  if (!id || typeof content !== 'string') return NextResponse.json({ error: 'id and content required' }, { status: 400 });
  try {
    const updated = await updateMessage(id, session.user.id, content);
    return NextResponse.json({ message: updated });
  } catch (e: any) {
    const msg = e.message || 'Failed to update message';
    const status = msg.includes('window expired') ? 403 : (msg.includes('authorized') ? 403 : 400);
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if(!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  try {
    const result = await deleteMessage(id, session.user.id);
    return NextResponse.json(result);
  } catch (e: any) {
    const msg = e.message || 'Failed to delete message';
    const status = msg.includes('window expired') ? 403 : (msg.includes('authorized') ? 403 : 400);
    return NextResponse.json({ error: msg }, { status });
  }
}