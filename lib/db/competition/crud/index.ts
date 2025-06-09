import { prisma } from "@/lib/db/prisma";
import { CompetitionFilter } from "../type";

export async function createCompetition(data: any) {
  try {
    const competition = await prisma.competition.create({
      data: data,
    });

    return competition;
  } catch (error) {
    throw error;
  }
}

export async function getCompetitions(filter?: CompetitionFilter) {
  try {
    const where: any = {};

    if (filter?.name) {
      where.name = { contains: filter.name, mode: "insensitive" };
    }

    if (filter?.organised_by) {
      where.organised_by = {
        contains: filter.organised_by,
        mode: "insensitive",
      };
    }

    if (filter?.payment) {
      where.payment = filter.payment;
    }

    const competitions = await prisma.competition.findMany({
      where,
      orderBy: {
        created_at: "desc",
      },
    });

    return competitions;
  } catch (error) {
    console.error("Error fetching competitions:", error);
    throw error;
  }
}

export async function getCompetitionById(id: number) {
  try {
    const competition = await prisma.competition.findUnique({
      where: { id },
    });

    if (!competition) {
      throw new Error(`Competition with ID ${id} not found`);
    }

    return competition;
  } catch (error) {
    console.error(`Error fetching competition with ID ${id}:`, error);
    throw error;
  }
}

export async function updateCompetition(id: number, data: any) {
  try {
    const updatedCompetition = await prisma.competition.update({
      where: { id },
      data: data,
    });

    return updatedCompetition;
  } catch (error) {
    console.error(`Error updating competition with ID ${id}:`, error);
    throw error;
  }
}

export async function deleteCompetition(id: number) {
  try {
    const competition = await prisma.competition.delete({
      where: { id },
    });

    return competition;
  } catch (error) {
    console.error(`Error deleting competition with ID ${id}:`, error);
    throw error;
  }
}
