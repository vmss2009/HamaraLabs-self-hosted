import { School as PrismaSchool } from "@prisma/client";
import { z } from "zod";
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


const PersonSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email().optional().or(z.literal("")),
  whatsapp: z.string().optional().or(z.literal(""))
});

export const schoolSchema = z.object({
  name: z.string().min(1, "School name is required"),
  is_ATL: z.boolean(),
  addressId: z.number().int().positive("Address ID must be a positive number"),
  in_charge: PersonSchema.optional(),
  correspondent: PersonSchema.optional(),
  principal: PersonSchema.optional(),
  syllabus: z.array(z.enum(["CBSE", "State", "ICSE", "IB", "IGCSE"])),
  website_url: z.string().url().optional().or(z.literal("")),
  paid_subscription: z.boolean(),
  social_links: z.array(z.string()).optional()
});
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