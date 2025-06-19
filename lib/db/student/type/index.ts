import { Student as PrismaStudent } from "@prisma/client";

export interface Student {
  instructions?: string;
  id: string;
  first_name: string;
  last_name: string;
}

export interface StudentCreateInput {
  first_name: string;
  last_name: string;
  aspiration: string;
  gender: string;
  email?: string;
  class: string;
  section: string;
  comments?: string;
  schoolId: string;
}

export interface StudentWithSchool extends PrismaStudent {
  school: {
    id: string;
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
  schoolId?: string;
}
