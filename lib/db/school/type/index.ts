import { School as PrismaSchool, User } from "@prisma/client";

export interface UserInput {
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  user_meta_data?: Record<string, any>; // Or a proper interface if structured
}

export interface SchoolCreateInput {
  name: string;
  is_ATL: boolean;
  ATL_establishment_year?: number | null;
  address_id: number;
  in_charge?: UserInput;
  principal?: UserInput;
  correspondent?: UserInput;
  syllabus: string[];
  website_url?: string;
  paid_subscription: boolean;
  social_links?: string[];
}

export interface SchoolWithAddress {
  id: string;
  created_at: Date;
  name: string;
  is_ATL: boolean;
  ATL_establishment_year: number | null;
  address_id: number;
  in_charge_id: string | null;
  correspondent_id: string | null;
  principal_id: string | null;
  syllabus: string[];
  website_url: string | null;
  paid_subscription: boolean;
  social_links: string[];
  address: {
    id: number;
    address_line1?: string | null;
    address_line2?: string | null;
    pincode: string;
    city_id: number;
    created_at: Date;
    city: {
      id: number;
      city_name: string;
      state_id: number;
      created_at: Date;
      state: {
        id: number;
        state_name: string;
        country_id: number;
        created_at: Date;
        country: {
          id: number;
          country_name: string;
          created_at: Date;
        };
      };
    };
  };
  in_charge?: User | null;
  correspondent?: User | null;
  principal?: User | null;
  users?: User[];
}

export interface SchoolFilter {
  name?: string;
  is_ATL?: boolean;
  paid_subscription?: boolean;
  cityId?: number;
  stateId?: number;
  countryId?: number;
}

export interface SchoolUpdateInput {
  name: string;
  is_ATL: boolean;
  ATL_establishment_year?: number | null;
  syllabus: string[];
  website_url?: string;
  paid_subscription: boolean;
  social_links?: string[];
  address: {
    address_line1: string;
    address_line2?: string;
    pincode: string;
    city_id: number;
  };
  correspondent?: {
    email: string;
    first_name: string;
    last_name: string;
    user_meta_data?: {
      phone_number?: string;
    };
    create_new?: boolean;
  };
  principal?: {
    email: string;
    first_name: string;
    last_name: string;
    user_meta_data?: {
      phone_number?: string;
    };
  };
  in_charge?: {
    email: string;
    first_name: string;
    last_name: string;
    user_meta_data?: {
      phone_number?: string;
    };
  };
}
