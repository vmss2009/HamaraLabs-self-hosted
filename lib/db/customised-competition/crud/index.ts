import { prisma } from "@/lib/db/prisma";
import { pruneCompetitionAttachments } from "@/lib/db/snapshot-attachments/crud";
import {
  CustomisedCompetitionCreateInput,
  CustomisedCompetitionFilter,
  CustomisedCompetitionWithRelations,
} from "../type";

export async function createCustomisedCompetition(
  data: CustomisedCompetitionCreateInput
): Promise<CustomisedCompetitionWithRelations> {
  return prisma.customisedCompetition.create({
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
