import { prisma } from "@/lib/db/prisma";

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
