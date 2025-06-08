import { prisma } from "@/lib/db/prisma";
import { SchoolVisitCreateInput, SchoolVisitFilter, SchoolVisitUpdateInput, SchoolVisitWithRelations } from "../type";

export async function createSchoolVisit(data: SchoolVisitCreateInput): Promise<SchoolVisitWithRelations> {
  return prisma.schoolVisit.create({
    data: {
      school_id: data.school_id,
      visit_date: data.visit_date,
      poc_id: data.poc_id,
      other_poc: data.other_poc,
      school_performance: data.school_performance,
      details: data.details,
    },
    include: {
      school: {
        select: {
          id: true,
          name: true,
        },
      },
      point_of_contact: {
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
        },
      },
    },
  });
}

export async function getSchoolVisits(filter?: SchoolVisitFilter): Promise<SchoolVisitWithRelations[]> {
  return prisma.schoolVisit.findMany({
    where: filter,
    include: {
      school: {
        select: {
          id: true,
          name: true,
        },
      },
      point_of_contact: {
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
        },
      },
    },
  });
}

export async function getSchoolVisitById(id: number): Promise<SchoolVisitWithRelations | null> {
  return prisma.schoolVisit.findUnique({
    where: { id },
    include: {
      school: {
        select: {
          id: true,
          name: true,
        },
      },
      point_of_contact: {
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
        },
      },
    },
  });
}

export async function updateSchoolVisit(id: number, data: SchoolVisitUpdateInput): Promise<SchoolVisitWithRelations> {
  return prisma.schoolVisit.update({
    where: { id },
    data: {
      school_id: data.school_id,
      visit_date: data.visit_date,
      poc_id: data.poc_id,
      other_poc: data.other_poc,
      school_performance: data.school_performance,
      details: data.details,
    },
    include: {
      school: {
        select: {
          id: true,
          name: true,
        },
      },
      point_of_contact: {
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
        },
      },
    },
  });
}

export async function deleteSchoolVisit(id: number): Promise<SchoolVisitWithRelations> {
  return prisma.schoolVisit.delete({
    where: { id },
    include: {
      school: {
        select: {
          id: true,
          name: true,
        },
      },
      point_of_contact: {
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
        },
      },
    },
  });
} 