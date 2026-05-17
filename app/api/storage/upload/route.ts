import { NextResponse } from 'next/server';
import s3 from '@/lib/storage/storage';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { auth } from '@/lib/auth/auth';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const session = await auth();
  if(!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const form = await req.formData();
  const file = form.get('file') as File | null;
  if(!file) return NextResponse.json({ error: 'file required' }, { status: 400 });
  const roomId = form.get('roomId') as string | null;
  if(!roomId) return NextResponse.json({ error: 'roomId required' }, { status: 400 });
  const arrayBuffer = await file.arrayBuffer();

  const userId = session.user.id.replaceAll('/', '_');
  const safeRoomId = roomId.replaceAll('/', '_');
  const orig = file.name || 'file';
  const dot = orig.lastIndexOf('.');
  const ext = dot > -1 && dot < orig.length - 1 ? orig.slice(dot) : '';
  const unique = randomUUID();
  const storedName = `${unique}${ext}`;
  const key = `${safeRoomId}/${userId}/${storedName}`;

  const contentType = (file.type || 'application/octet-stream').split(';')[0];
  await s3.send(new PutObjectCommand({
    Bucket: 'chat',
    Key: key,
    Body: Buffer.from(arrayBuffer),
    ContentType: contentType,
  }));
  const url = `${process.env.S3_PUBLIC_URL?.replace(/\/$/, '') || process.env.S3_ENDPOINT}/${'chat'}/${key}`;
  return NextResponse.json({ url, key });
}