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
  const courseId = form.get('courseId') as string | null;
  if(!courseId) return NextResponse.json({ error: 'courseId required' }, { status: 400 });

  const arrayBuffer = await file.arrayBuffer();

  const safeId = courseId.replaceAll('/', '_');
  const orig = file.name || 'file';
  const dot = orig.lastIndexOf('.');
  const ext = dot > -1 && dot < orig.length - 1 ? orig.slice(dot) : '';
  const unique = randomUUID();
  const storedName = `${unique}${ext}`;
  // Path: customised-course/{id}/files/{uuid}.{ext}
  const key = `customised-course/${safeId}/files/${storedName}`;

  const bucket = 'course';
  const contentType = (file.type || 'application/octet-stream').split(';')[0];
  await s3.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: Buffer.from(arrayBuffer),
    ContentType: contentType,
  }));
  const base = (process.env.S3_PUBLIC_URL?.replace(/\/$/, '') || process.env.S3_ENDPOINT)?.replace(/\/$/, '');
  const url = `${base}/${bucket}/${key}`;
  return NextResponse.json({
    url,
    key,
    filename: orig,
    type: contentType,
    size: arrayBuffer.byteLength,
  });
}