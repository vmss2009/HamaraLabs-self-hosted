import { prisma } from "@/lib/db/prisma";
import { pruneCompetitionAttachments } from "@/lib/db/snapshot-attachments/crud";
import { notifyStudentAssignment, notifyStudentStatusUpdate } from "@/lib/notifications/service";

function haveStatusesChanged(previous: string[] | null | undefined, next: string[] | null | undefined) {
  if (!next) return false;
  const prev = previous ?? [];
  if (prev.length !== next.length) return true;
  const prevSet = new Set(prev);
  const nextSet = new Set(next);
  if (prevSet.size !== nextSet.size) return true;
  for (const status of nextSet) {
    if (!prevSet.has(status)) return true;
  }
  return false;
}
import {
  CustomisedCompetitionCreateInput,
  CustomisedCompetitionFilter,
  CustomisedCompetitionWithRelations,
} from "../type";

export async function createCustomisedCompetition(
  data: CustomisedCompetitionCreateInput
): Promise<CustomisedCompetitionWithRelations> {
  const created = await prisma.customisedCompetition.create({
    data: {
      competition_id: data.competition_id,
      student_id: data.student_id,
      status: data.status,
      comments: (data as any).comments,
      attachments: (data as any).attachments,
    },
    include: {
      competition: {
        select: {
          id: true,
          name: true,
          description: true,
          eligibility: true,
          requirements: true,
          fee: true,
          payment: true,
          application_end_date: true,
          application_start_date: true,
          competition_end_date: true,
          competition_start_date: true,
          organised_by: true,
          reference_links: true,
        },
      },
      student: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
        },
      },
      snapshot_attachments: true,
    },
  });

  await notifyStudentAssignment({
    studentId: created.student.id,
    entityType: "competition",
    entityName: created.competition.name,
    resourceId: created.id,
  });

  return created;
}

export async function getCustomisedCompetitions(
  filter?: CustomisedCompetitionFilter
): Promise<CustomisedCompetitionWithRelations[]> {
  return prisma.customisedCompetition.findMany({
    where: {
      competition_id: filter?.competition_id,
      student_id: filter?.student_id,
      status: filter?.status ? { hasSome: filter.status } : undefined,
    },
    include: {
      competition: {
        select: {
          id: true,
          name: true,
          description: true,
          eligibility: true,
          requirements: true,
          fee: true,
          payment: true,
          application_end_date: true,
          application_start_date: true,
          competition_end_date: true,
          competition_start_date: true,
          organised_by: true,
          reference_links: true,
        },
      },
      student: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
        },
      },
      snapshot_attachments: true,
    },
  });
}

export async function getCustomisedCompetitionById(
  id: string
): Promise<CustomisedCompetitionWithRelations | null> {
  return prisma.customisedCompetition.findUnique({
    where: { id },
    include: {
      competition: {
        select: {
          id: true,
          name: true,
          description: true,
          eligibility: true,
          requirements: true,
          fee: true,
          payment: true,
          application_end_date: true,
          application_start_date: true,
          competition_end_date: true,
          competition_start_date: true,
          organised_by: true,
          reference_links: true,
        },
      },
      student: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
        },
      },
      snapshot_attachments: true,
    },
  });
}

export async function updateCustomisedCompetition(
  id: string,
  data: Partial<CustomisedCompetitionCreateInput> & { keepSnapshotAttachmentUrls?: string[] }
): Promise<CustomisedCompetitionWithRelations> {
  const keepUrls = data.keepSnapshotAttachmentUrls || [];
  const existing = await prisma.customisedCompetition.findUnique({
    where: { id },
    select: { status: true },
  });
  const updated = await prisma.customisedCompetition.update({
    where: { id },
    data: {
      competition_id: data.competition_id,
      student_id: data.student_id,
      status: data.status,
      comments: (data as any).comments,
      attachments: (data as any).attachments,
    },
    include: {
      competition: {
        select: {
          id: true,
          name: true,
          description: true,
          eligibility: true,
          requirements: true,
          fee: true,
          payment: true,
          application_end_date: true,
          application_start_date: true,
          competition_end_date: true,
          competition_start_date: true,
          organised_by: true,
          reference_links: true,
        },
      },
      student: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
        },
      },
      snapshot_attachments: true,
    },
  });
  if (Object.prototype.hasOwnProperty.call(data, 'keepSnapshotAttachmentUrls')) {
    await pruneCompetitionAttachments(id, keepUrls);
  }
  if (haveStatusesChanged(existing?.status, Array.isArray(data.status) ? data.status : undefined)) {
    await notifyStudentStatusUpdate({
      studentId: updated.student.id,
      entityType: "competition",
      entityName: updated.competition.name,
      statusList: Array.isArray(updated.status) ? updated.status : [],
      resourceId: updated.id,
    });
  }
  return updated;
}

export async function deleteCustomisedCompetition(
  id: string
): Promise<CustomisedCompetitionWithRelations> {
  return prisma.customisedCompetition.delete({
    where: { id },
    include: {
      competition: {
        select: {
          id: true,
          name: true,
          description: true,
          eligibility: true,
          requirements: true,
          fee: true,
          payment: true,
          application_end_date: true,
          application_start_date: true,
          competition_end_date: true,
          competition_start_date: true,
          organised_by: true,
          reference_links: true,
        },
      },
      student: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
        },
      },
    },
  });
}
