import { NextResponse } from "next/server";
import { createSchool, getSchools } from "@/lib/db/school/crud";
import { createAddress } from "@/lib/db/address/crud";
import { z } from "zod";

const PersonSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.union([z.string().email(), z.literal("")]).optional(),
  whatsapp: z.union([z.string(), z.literal("")]).optional(),
});

export const schoolSchema = z.object({
  name: z.string().min(1, "School name is required"),
  is_ATL: z.boolean(),
  address: z.object({
    address_line1: z.string().min(1, "Address line 1 is required"),
    address_line2: z.string().optional(),
    pincode: z.string().min(1, "Pincode is required"),
    cityId: z.number().int().positive("City ID must be a positive number"),
  }),
  in_charge: PersonSchema.optional(),
  correspondent: PersonSchema.optional(),
  principal: PersonSchema.optional(),
  syllabus: z.array(z.enum(["CBSE", "State", "ICSE", "IB", "IGCSE"])),
  website_url: z
    .string()
    .trim()
    .url("Website link must be a valid URL")
    .optional()
    .or(z.literal("")),
  paid_subscription: z.boolean(),
  social_links: z
    .array(z.string().url("Social Link must be a valid URL"))
    .optional(),
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
    const body = await request.json();

    console.log("Incoming data", body);

    const result = schoolSchema.safeParse(body);

    if (!result.success) {
      const errorMessages = result.error.errors.map((err) => err.message);
      console.error("Validation failed:", errorMessages);
      return NextResponse.json({ error: errorMessages[0] }, { status: 400 });
    }

    const validatedData = result.data;

    console.log("Datta", validatedData);

    const address = await createAddress({
      address_line1: validatedData.address.address_line1,
      address_line2: validatedData.address.address_line2,
      pincode: validatedData.address.pincode,
      cityId: validatedData.address.cityId,
    });

    const school = await createSchool({
      name: validatedData.name,
      is_ATL: validatedData.is_ATL,
      addressId: address.id,
      in_charge: validatedData.in_charge,
      correspondent: validatedData.correspondent,
      principal: validatedData.principal,
      syllabus: validatedData.syllabus,
      website_url: validatedData.website_url,
      paid_subscription: validatedData.paid_subscription,
      social_links: validatedData.social_links ?? [],
    });

    return NextResponse.json(school, { status: 201 });
  } catch (error) {
    console.error("Error creating school:", error);

    const errorMessage = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      { error: "Failed to create school", message: errorMessage },
      { status: 500 }
    );
  }
}
