import { CustomisedCompetition as PrismaCustomisedCompetition } from "@prisma/client";

export interface CustomisedCompetitionCreateInput {
  competition_id: number;
  student_id: number;
  status: string[];
}

export interface CustomisedCompetitionWithRelations extends PrismaCustomisedCompetition {
  competition: {
    id: number;
    name: string;
    description: string;
    eligibility: string[];
    requirements: string[];
    fee: string | null;
    payment: string;
    application_end_date: Date;
    application_start_date: Date;
    competition_end_date: Date;
    competition_start_date: Date;
    organised_by: string;
    reference_links: string[];
  };
  student: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

export interface CustomisedCompetitionFilter {
  competition_id?: number;
  student_id?: number;
  status?: string[];
} 