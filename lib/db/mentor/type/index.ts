import { SchoolWithAddress } from "../../school/type";

export interface Mentor {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  user_meta_data: {
    phone_number: string;
  };
  schools: SchoolWithAddress[];
}

export interface MentorCreateInput {
  first_name: string;
  last_name: string;
  email: string;
  user_meta_data: {
    phone_number: string;
  };
  school_ids: string[];
}

export interface MentorUpdateInput {
  first_name?: string;
  last_name?: string;
  email?: string;
  user_meta_data?: {
    phone_number: string;
  };
  school_ids?: string[];
}

export interface MentorFilter {
  name?: string;
  email?: string;
  schoolId?: string;
} 