import { User } from "@prisma/client";
import { z } from "zod";

export interface UserInput {
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  user_meta_data?: Record<string, unknown>;
}

export interface SchoolCreateInput {
  name: string;
  udise_code?: string;
  is_ATL: boolean;
  ATL_establishment_year?: number | null;
  address_id: number;
  in_charges: UserInput[];
  principals: UserInput[];
  correspondents: UserInput[];
  syllabus: string[];
  website_url?: string;
  paid_subscription: boolean;
  social_links?: string[];
}

export interface SchoolWithAddress {
  id: string;
  created_at: Date;
  name: string;
  udise_code: string | null;
  is_ATL: boolean;
  ATL_establishment_year: number | null;
  address_id: number;
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
  udise_code?: string;
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
  correspondents: {
    email: string;
    first_name: string;
    last_name: string;
    user_meta_data?: {
      phone_number?: string;
    };
  }[];
  principals: {
    email: string;
    first_name: string;
    last_name: string;
    user_meta_data?: {
      phone_number?: string;
    };
  }[];
  in_charges: {
    email: string;
    first_name: string;
    last_name: string;
    user_meta_data?: {
      phone_number?: string;
    };
  }[];
}

const userMetadataSchema = z.object({
  phone_number: z.string().optional(),
});

const userSchema = z.object({
  email: z.string().email(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  user_meta_data: userMetadataSchema.optional(),
});

const addressSchema = z.object({
  address_line1: z.string().min(1),
  address_line2: z.string().optional(),
  pincode: z.string().min(5),
  cityId: z.number().int(),
});

export const schoolSchema = z.object({
  name: z.string().min(1),
  udise_code: z.string().optional(),
  is_ATL: z.boolean(),
  ATL_establishment_year: z.number().int().nullable().optional(),
  address: addressSchema,
  in_charges: z.array(userSchema).min(1, "At least one in-charge is required"),
  correspondents: z.array(userSchema),
  principals: z.array(userSchema),
  syllabus: z.array(z.string()),
  website_url: z.string().url().optional().or(z.literal("")),
  paid_subscription: z.boolean(),
  social_links: z.array(z.string().url()).optional(),
}).superRefine((data, ctx) => {
  // If is_ATL is true, year must be provided (non-null number)
  if (data.is_ATL) {
    if (data.ATL_establishment_year === null || data.ATL_establishment_year === undefined) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "ATL establishment year is required when ATL is enabled", path: ["ATL_establishment_year"] });
    }
  }
}).refine(
  (data) => {
    // Check for duplicate emails within in_charges
    const inChargeEmails = data.in_charges.map(u => u.email.toLowerCase().trim());
    const uniqueInChargeEmails = new Set(inChargeEmails);
    return uniqueInChargeEmails.size === inChargeEmails.length;
  },
  {
    message: "Duplicate emails found among in-charges",
    path: ["in_charges"],
  }
).refine(
  (data) => {
    // Check for duplicate emails within principals
    const principalEmails = data.principals.map(u => u.email.toLowerCase().trim());
    const uniquePrincipalEmails = new Set(principalEmails);
    return uniquePrincipalEmails.size === principalEmails.length;
  },
  {
    message: "Duplicate emails found among principals",
    path: ["principals"],
  }
).refine(
  (data) => {
    // Check for duplicate emails within correspondents
    const correspondentEmails = data.correspondents.map(u => u.email.toLowerCase().trim());
    const uniqueCorrespondentEmails = new Set(correspondentEmails);
    return uniqueCorrespondentEmails.size === correspondentEmails.length;
  },
  {
    message: "Duplicate emails found among correspondents",
    path: ["correspondents"],
  }
).superRefine((data, ctx) => {
  // Cross-role uniqueness: the same email must not appear in more than one role list
  const norm = (s: string) => s.toLowerCase().trim();
  const inchargeSet = new Set(data.in_charges.map(u => norm(u.email)));
  const principalSet = new Set(data.principals.map(u => norm(u.email)));
  const correspondentSet = new Set(data.correspondents.map(u => norm(u.email)));

  const duplicates = new Set<string>();

  // incharge overlapping with principal/correspondent
  for (const e of inchargeSet) {
    if (principalSet.has(e) || correspondentSet.has(e)) duplicates.add(e);
  }
  // principal overlapping with correspondent
  for (const e of principalSet) {
    if (correspondentSet.has(e)) duplicates.add(e);
  }

  if (duplicates.size > 0) {
    const dupList = Array.from(duplicates).join(", ");
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Emails cannot repeat across In-charges, Principals, and Correspondents: ${dupList}`,
      path: ["in_charges"],
    });
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Emails cannot repeat across In-charges, Principals, and Correspondents: ${dupList}`,
      path: ["principals"],
    });
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Emails cannot repeat across In-charges, Principals, and Correspondents: ${dupList}`,
      path: ["correspondents"],
    });
  }
});
