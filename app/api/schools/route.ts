import { NextResponse } from "next/server";
import { createSchool, getSchools } from "@/lib/db/school/crud";
import { createAddress } from "@/lib/db/address/crud";

import { z } from "zod";

const userMetadataSchema = z.object({
  phone_number: z.string().optional(),
});

const userSchema = z.object({
  email: z.string().email(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  user_meta_data: userMetadataSchema,
});

const addressSchema = z.object({
  address_line1: z.string().min(1),
  address_line2: z.string().optional(),
  pincode: z.string().min(5),
  cityId: z.number().int(),
});

export const schoolSchema = z.object({
  name: z.string().min(1),
  is_ATL: z.boolean(),
  ATL_establishment_year: z.number().int().optional(),
  address: addressSchema,
  in_charge: userSchema,
  correspondent: userSchema,
  principal: userSchema,
  syllabus: z.array(z.string()),
  website_url: z.string().url().optional().or(z.literal("")),
  paid_subscription: z.boolean(),
  social_links: z.array(z.string().url()).optional(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = {
      name: searchParams.get("name") || undefined,
      cityId: searchParams.get("cityId")
        ? parseInt(searchParams.get("cityId")!)
        : undefined,
      stateId: searchParams.get("stateId")
        ? parseInt(searchParams.get("stateId")!)
        : undefined,
      countryId: searchParams.get("countryId")
        ? parseInt(searchParams.get("countryId")!)
        : undefined,
    };

    const schools = await getSchools(filter);
    return NextResponse.json(schools);
  } catch (error) {
    console.error("Error fetching schools:", error);
    return NextResponse.json(
      { error: "Failed to fetch schools" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const result = schoolSchema.safeParse(data);

    if (!result.success) {
      const errorMessages = result.error.errors.map((err) => err.message);
      console.error("Validation failed:", errorMessages);
      return NextResponse.json({ error: errorMessages[0] }, { status: 400 });
    }

    const validatedData = result.data;
    const address = await createAddress({
      address_line1: validatedData.address.address_line1,
      address_line2: validatedData.address.address_line2,
      pincode: validatedData.address.pincode,
      cityId: validatedData.address.cityId,
    });

    const school = await createSchool({
      name: validatedData.name,
      is_ATL: validatedData.is_ATL,
      ATL_establishment_year: validatedData.ATL_establishment_year,
      address_id: address.id,
      in_charge: validatedData.in_charge,
      correspondent: validatedData.correspondent,
      principal: validatedData.principal,
      syllabus: validatedData.syllabus,
      website_url: validatedData.website_url,
      paid_subscription: validatedData.paid_subscription,
      social_links: validatedData.social_links,
    });

    return NextResponse.json(school, { status: 201 });
  } catch (error) {
    console.error("Error creating school:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to create school" },
      { status: 500 }
    );
  }
}
