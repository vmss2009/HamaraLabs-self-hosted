import { prisma } from "@/lib/db/prisma";
import s3 from "@/lib/storage/storage";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

export interface SnapshotAttachmentInput {
  url: string;
  type: string;
  filename?: string | null;
  size?: number | null;
}

export async function createTAAttachments(customised_ta_id: string, items: SnapshotAttachmentInput[]) {
  if (!Array.isArray(items) || items.length === 0) return [];
  // createMany won't return created rows; create individually for metadata return
  const created = [] as any[];
  for (const it of items) {
    const row = await prisma.snapshotAttachments.create({
      data: {
        customised_ta_id,
        url: it.url,
        type: it.type,
        filename: it.filename ?? null,
        size: typeof it.size === 'number' ? Math.floor(it.size) : null,
      },
    });
    created.push(row);
  }
  return created;
}

export async function createCompetitionAttachments(customised_competition_id: string, items: SnapshotAttachmentInput[]) {
  if (!Array.isArray(items) || items.length === 0) return [];
  const created = [] as any[];
  for (const it of items) {
    const row = await prisma.snapshotAttachments.create({
      data: {
        customised_competition_id,
        url: it.url,
        type: it.type,
        filename: it.filename ?? null,
        size: typeof it.size === 'number' ? Math.floor(it.size) : null,
      },
    });
    created.push(row);
  }
  return created;
}

export async function createCourseAttachments(customised_course_id: string, items: SnapshotAttachmentInput[]) {
  if (!Array.isArray(items) || items.length === 0) return [];
  const created = [] as any[];
  for (const it of items) {
    const row = await prisma.snapshotAttachments.create({
      data: {
        customised_course_id,
        url: it.url,
        type: it.type,
        filename: it.filename ?? null,
        size: typeof it.size === 'number' ? Math.floor(it.size) : null,
      },
    });
    created.push(row);
  }
  return created;
}

export async function deleteTAAttachmentsByUrls(customised_ta_id: string, urls: string[]) {
  if (!Array.isArray(urls) || urls.length === 0) return { count: 0 };
  return prisma.snapshotAttachments.deleteMany({
    where: { customised_ta_id, url: { in: urls } },
  });
}

export async function deleteCompetitionAttachmentsByUrls(customised_competition_id: string, urls: string[]) {
  if (!Array.isArray(urls) || urls.length === 0) return { count: 0 };
  return prisma.snapshotAttachments.deleteMany({
    where: { customised_competition_id, url: { in: urls } },
  });
}

export async function deleteCourseAttachmentsByUrls(customised_course_id: string, urls: string[]) {
  if (!Array.isArray(urls) || urls.length === 0) return { count: 0 };
  return prisma.snapshotAttachments.deleteMany({
    where: { customised_course_id, url: { in: urls } },
  });
}

// Prune helpers: remove snapshot attachments no longer present after an edit.
// If keepUrls is empty, all snapshot attachments for that entity are removed.
export async function pruneTAAttachments(customised_ta_id: string, keepUrls: string[]): Promise<number> {
  const where: any = { customised_ta_id };
  if (keepUrls.length > 0) where.url = { notIn: keepUrls };
  // Fetch rows to delete so we can remove from storage
  const toDelete = await prisma.snapshotAttachments.findMany({ where });
  const res = await prisma.snapshotAttachments.deleteMany({ where });
  // Derive keys from URLs and delete from S3 (best-effort)
  await deleteStorageObjectsFor('tinkering-activity', toDelete.map(r => r.url));
  return res.count;
}

export async function pruneCompetitionAttachments(customised_competition_id: string, keepUrls: string[]): Promise<number> {
  const where: any = { customised_competition_id };
  if (keepUrls.length > 0) where.url = { notIn: keepUrls };
  const toDelete = await prisma.snapshotAttachments.findMany({ where });
  const res = await prisma.snapshotAttachments.deleteMany({ where });
  await deleteStorageObjectsFor('competition', toDelete.map(r => r.url));
  return res.count;
}

export async function pruneCourseAttachments(customised_course_id: string, keepUrls: string[]): Promise<number> {
  const where: any = { customised_course_id };
  if (keepUrls.length > 0) where.url = { notIn: keepUrls };
  const toDelete = await prisma.snapshotAttachments.findMany({ where });
  const res = await prisma.snapshotAttachments.deleteMany({ where });
  await deleteStorageObjectsFor('course', toDelete.map(r => r.url));
  return res.count;
}

// Helper: extract S3 object keys based on known bucket URL patterns and delete
async function deleteStorageObjectsFor(bucket: string, urls: string[]) {
  if (!urls || urls.length === 0) return;
  const base = (process.env.S3_PUBLIC_URL?.replace(/\/$/, '') || process.env.S3_ENDPOINT)?.replace(/\/$/, '');
  if (!base) return; // cannot resolve base -> skip
  const prefix = `${base}/${bucket}/`;
  const deletions: Promise<any>[] = [];
  for (const u of urls) {
    if (!u.startsWith(prefix)) continue;
    const key = u.slice(prefix.length);
    if (!key) continue;
    deletions.push(
      s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key })).catch(() => {})
    );
  }
  if (deletions.length > 0) {
    await Promise.allSettled(deletions);
  }
}
