import { prisma } from "@/lib/db/prisma";
import { CompetitionFilter } from "../type";
import { competitionSchema } from "../type";

export async function createCompetition(data: any) {
  try {
    const result = competitionSchema.safeParse(data);

    if (!result.success) {
      const errorMessages = result.error.errors.map(
        (err) => `${err.path.join(".")}: ${err.message}`
      );
      throw new Error(errorMessages[0]);
    }

    const { id, ...validatedData } = result.data as any;

    const competition = await prisma.competition.create({
      data: validatedData,
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
    const result = competitionSchema.safeParse(data);

    if (!result.success) {
      const errorMessages = result.error.errors.map(
        (err) => `${err.path.join(".")}: ${err.message}`
      );
      console.error("Validation failed:", errorMessages);
      throw new Error(errorMessages[0]);
    }

    const validatedData = result.data;

    const updatedCompetition = await prisma.competition.update({
      where: { id },
      data: validatedData,
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
