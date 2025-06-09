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
  schoolId: string;
}

export interface StudentWithSchool {
  id: string;
  created_at: Date;
  first_name: string;
  last_name: string;
  aspiration: string;
  gender: string;
  email: string | null;
  class: string;
  section: string;
  comments: string | null;
  school_id: string;
  user_id: string | null;
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
  school_id?: string;
} 