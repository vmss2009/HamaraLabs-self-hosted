import { CustomisedCompetition as PrismaCustomisedCompetition } from "@prisma/client";

export interface CustomisedCompetitionCreateInput {
  competition_id: string;
  student_id: string;
  status: string[];
  comments: string;
}

export interface CustomisedCompetitionWithRelations
  extends PrismaCustomisedCompetition {
  competition: {
    id: string;
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
    id: string;
    first_name: string;
    last_name: string;
  };
}

export interface CustomisedCompetitionFilter {
  competition_id?: string;
  student_id?: string;
  status?: string[];
}
