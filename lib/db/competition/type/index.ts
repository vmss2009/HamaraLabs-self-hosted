import { Competition as PrismaCompetition } from "@prisma/client";

export interface CompetitionCreateInput {
  name: string;
  description: string;
  eligibility: string[];
  requirements: string[];
  fee?: string | null;
  payment: string;
  application_end_date: Date;
  application_start_date: Date;
  competition_end_date: Date;
  competition_start_date: Date;
  organised_by: string;
  reference_links: string[];
}

export interface CompetitionUpdateInput extends Partial<CompetitionCreateInput> {}

export interface CompetitionFilter {
  name?: string;
  organised_by?: string;
  payment?: string;
} 