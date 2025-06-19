import { SchoolVisit as PrismaSchoolVisit } from "@prisma/client";

export interface SchoolVisitCreateInput {
  school_id: string;
  visit_date: Date;
  poc_id?: string | null;
  other_poc?: string;
  school_performance?: string;
  details: Record<string, string>;
}

export interface SchoolVisitUpdateInput {
  school_id: string;
  visit_date: Date;
  poc_id?: string | null;
  other_poc?: string;
  school_performance?: string;
  details: Record<string, string>;
}

export interface SchoolVisitFilter {
  school_id?: string;
  visit_date?: Date;
  poc_id?: string;
  school_performance?: string;
}

export interface SchoolVisitWithRelations extends PrismaSchoolVisit {
  id: string;
  school: {
    id: string;
    name: string;
  };
  point_of_contact: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
  } | null;
}
