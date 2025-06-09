import { School as PrismaSchool } from "@prisma/client";
import { z } from "zod";

export interface School {
  id: number;
  name: string;
  is_ATL: boolean;
  paid_subscription: boolean;
  website_url: string;
  social_links: string[];
  syllabus: string[];
  addressLine1: string;
  addressLine2?: string;
  cityId?: number;
  stateId?: number;
  countryId?: number;
  pincode?: string;
  principalEmail?: string;
  principalFirstName?: string;
  principalLastName?: string;
  principalNumber?: string;
  correspondentEmail?: string;
  correspondentFirstName?: string;
  correspondentLastName?: string;
  correspondentNumber?: string;
  inChargeEmail?: string;
  inChargeFirstName?: string;
  inChargeLastName?: string;
  inChargeNumber?: string;
  city?: string;
  state?: string;
  country?: string;
}
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