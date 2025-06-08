import { Student as PrismaStudent } from "@prisma/client";

export interface StudentCreateInput {
  first_name: string;
  last_name: string;
  aspiration: string;
  gender: string;
  email?: string;
  class: string;
  section: string;
  comments?: string;
  schoolId: number;
}

export interface StudentWithSchool extends PrismaStudent {
  school: {
    id: number;
    name: string;
    is_ATL: boolean;
  };
}

export interface StudentFilter {
  first_name?: string;
  last_name?: string;
  gender?: string;
  class?: string;
  section?: string;
  school_id?: number;
} 