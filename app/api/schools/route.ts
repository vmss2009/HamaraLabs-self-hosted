import { NextResponse } from "next/server";
import { createSchool, getSchools } from "@/lib/db/school/crud";
import { createAddress } from "@/lib/db/address/crud";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const filter = {
            name: searchParams.get("name") || undefined,
            cityId: searchParams.get("cityId") ? parseInt(searchParams.get("cityId")!) : undefined,
            stateId: searchParams.get("stateId") ? parseInt(searchParams.get("stateId")!) : undefined,
            countryId: searchParams.get("countryId") ? parseInt(searchParams.get("countryId")!) : undefined,
        };

        const schools = await getSchools(filter);
        return NextResponse.json(schools);
    } catch (error) {
        console.error('Error fetching schools:', error);
        return NextResponse.json(
            { error: 'Failed to fetch schools' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        
        // Create a new address using the CRUD function
        const address = await createAddress({
            address_line1: body.address.address_line1,
            address_line2: body.address.address_line2,
            pincode: body.address.pincode,
            cityId: body.address.cityId,
        });

        // Create the school with the new address
        const school = await createSchool({
            name: body.name,
            is_ATL: body.is_ATL,
            address_id: address.id,
            in_charge: body.in_charge,
            correspondent: body.correspondent,
            principal: body.principal,
            syllabus: body.syllabus,
            website_url: body.website_url,
            paid_subscription: body.paid_subscription,
            social_links: body.social_links,
        });

        return NextResponse.json(school, { status: 201 });
    } catch (error) {
        console.error('Error creating school:', error);
        return NextResponse.json(
            { error: 'Failed to create school' },
            { status: 500 }
        );
    }
} 