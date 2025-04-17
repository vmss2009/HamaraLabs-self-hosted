import { prisma } from "@/lib/db/prisma";
import { CompetitionCreateInput, CompetitionUpdateInput, CompetitionFilter } from "../type";

export async function createCompetition(data: CompetitionCreateInput) {
  try {
    // Ensure dates are properly formatted
    const formattedData = {
      ...data,
      fee: data.fee || null,
      application_start_date: new Date(data.application_start_date),
      application_end_date: new Date(data.application_end_date),
      competition_start_date: new Date(data.competition_start_date),
      competition_end_date: new Date(data.competition_end_date),
    };
    
    const competition = await prisma.competition.create({
      data: formattedData,
    });
    
    return competition;
  } catch (error) {
    console.error("Error creating competition:", error);
    throw error;
  }
}

export async function getCompetitions(filter?: CompetitionFilter) {
  try {
    const where: any = {};
    
    if (filter?.name) {
      where.name = { contains: filter.name, mode: 'insensitive' };
    }
    
    if (filter?.organised_by) {
      where.organised_by = { contains: filter.organised_by, mode: 'insensitive' };
    }
    
    if (filter?.payment) {
      where.payment = filter.payment;
    }
    
    const competitions = await prisma.competition.findMany({
      where,
      orderBy: {
        created_at: 'desc',
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

export async function updateCompetition(id: number, data: CompetitionUpdateInput) {
  try {
    // Format dates if they exist in the update data
    const formattedData = { ...data };
    
    if (data.application_start_date) {
      formattedData.application_start_date = new Date(data.application_start_date);
    }
    
    if (data.application_end_date) {
      formattedData.application_end_date = new Date(data.application_end_date);
    }
    
    if (data.competition_start_date) {
      formattedData.competition_start_date = new Date(data.competition_start_date);
    }
    
    if (data.competition_end_date) {
      formattedData.competition_end_date = new Date(data.competition_end_date);
    }
    
    const competition = await prisma.competition.update({
      where: { id },
      data: formattedData,
    });
    
    return competition;
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