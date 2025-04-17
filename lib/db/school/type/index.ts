import { School as PrismaSchool } from "@prisma/client";

export interface SchoolCreateInput {
  name: string;
  is_ATL: boolean;
  addressId: number;
  in_charge?: Record<string, any>;
  correspondent?: Record<string, any>;
  principal?: Record<string, any>;
  syllabus: string[];
  website_url?: string;
  paid_subscription: boolean;
  social_links: string[];
}

export interface SchoolWithAddress extends PrismaSchool {
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
}

export interface SchoolFilter {
  name?: string;
  is_ATL?: boolean;
  paid_subscription?: boolean;
  cityId?: number;
  stateId?: number;
  countryId?: number;
} 