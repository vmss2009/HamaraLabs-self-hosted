import { prisma } from "@/lib/db/prisma";
import { CustomisedCompetitionCreateInput, CustomisedCompetitionFilter, CustomisedCompetitionWithRelations } from "../type";

export async function createCustomisedCompetition(data: CustomisedCompetitionCreateInput): Promise<CustomisedCompetitionWithRelations> {
  return prisma.customisedCompetition.create({
    data: {
      competition_id: data.competition_id,
      student_id: data.student_id,
      status: data.status,
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
    },
  });
}

export async function getCustomisedCompetitions(filter?: CustomisedCompetitionFilter): Promise<CustomisedCompetitionWithRelations[]> {
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
    },
  });
}

export async function getCustomisedCompetitionById(id: number): Promise<CustomisedCompetitionWithRelations | null> {
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
    },
  });
}

export async function updateCustomisedCompetition(id: number, data: Partial<CustomisedCompetitionCreateInput>): Promise<CustomisedCompetitionWithRelations> {
  return prisma.customisedCompetition.update({
    where: { id },
    data: {
      competition_id: data.competition_id,
      student_id: data.student_id,
      status: data.status,
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
    },
  });
}

export async function deleteCustomisedCompetition(id: number): Promise<CustomisedCompetitionWithRelations> {
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
