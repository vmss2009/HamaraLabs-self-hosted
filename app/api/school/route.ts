import { z } from "zod";
import { NextResponse } from "next/server";
import { addSchool } from "@/lib/db/school/crud/school";
import { addAddress } from "@/lib/db/address/crud/address";
import type { School } from "@/lib/db/school/types/school";
import type { Address } from "@/lib/db/address/types/address";
import { User } from "@supabase/supabase-js";
import { createUserUsingMagicLink } from "@/lib/auth/user";

const addressSchema = z.object({
    address_line1: z.string().optional(),
    address_line2: z.string().optional(),
    city: z.string().nonempty(),
    pincode: z.string().nonempty(),
});

const personSchema = z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().email().or(z.literal("")).optional(),
    whatsapp: z.string().optional(),
});

const schema = z.object({
    name: z.string().nonempty(),
    is_ATL: z.enum(["Yes", "No"]),
    address: addressSchema,
    in_charge: personSchema.optional(),
    correspondent: personSchema.optional(),
    principal: personSchema.optional(),
    syllabus: z.array(z.enum(["CBSE", "State", "ICSE", "IGCSE", "IB"])),
    website_url: z.string().url().optional(),
    paid_subscription: z.enum(["Yes", "No"]).optional(),
    social_links: z.array(z.string().url()).optional(),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validatedData = schema.parse(body);

        const address: Address[]  = await addAddress(validatedData.address as unknown as Address);
        const schoolData: Omit<School, "id" | "created_at"> = {
            name: validatedData.name,
            is_ATL: validatedData.is_ATL === "Yes",
            address: address[0].id,
            syllabus: validatedData.syllabus,
            website_url: validatedData.website_url,
            paid_subscription: validatedData.paid_subscription === "Yes",
            social_links: validatedData.social_links,
        }

        if (validatedData.in_charge?.email) {
            const inChargeMetaData = {
                role: "inCharge",
                firstName: validatedData.in_charge.firstName,
                lastName: validatedData.in_charge.lastName,
                whatsapp: validatedData.in_charge.whatsapp,
            }
            const inchargeInvite: {user: User} = await createUserUsingMagicLink(validatedData.in_charge?.email as string, inChargeMetaData);
            schoolData.in_charge = inchargeInvite.user.id;
        }
        if (validatedData.correspondent?.email) {
            const correspondentMetaData = {
                role: "correspondent",
                firstName: validatedData.correspondent.firstName,
                lastName: validatedData.correspondent.lastName,
                whatsapp: validatedData.correspondent.whatsapp,
            }
            const correspondentInvite: {user: User} = await createUserUsingMagicLink(validatedData.correspondent?.email as string, correspondentMetaData);
            schoolData.correspondent = correspondentInvite.user.id;
        }
        if (validatedData.principal?.email) {

            const principalMetaData = {
                role: "principal",
                firstName: validatedData.principal.firstName,
                lastName: validatedData.principal.lastName,
                whatsapp: validatedData.principal.whatsapp,
            }
            const principalInvite: {user: User} = await createUserUsingMagicLink(validatedData.principal?.email as string, principalMetaData);
            schoolData.principal = principalInvite.user.id;
        }

        await addSchool(schoolData);

        return NextResponse.json({ message: "Form submitted successfully!" });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { message: error.errors.map((err) => err.message).join(", ") },
                { status: 400 }
            );
        }
        console.log(error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}