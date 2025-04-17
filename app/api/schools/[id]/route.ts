import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSchoolById, updateSchool, deleteSchool } from "@/lib/db/school/crud";
import { getAddressById, updateAddress, deleteAddress } from "@/lib/db/address/crud";
import { Prisma } from "@prisma/client";

export async function GET(
    request: NextRequest,
    { params }: any
) {
    try {
        const id = parseInt(params.id);
        const school = await getSchoolById(id);
        
        if (!school) {
            return NextResponse.json(
                { error: "School not found" },
                { status: 404 }
            );
        }
        
        return NextResponse.json(school);
    } catch (error) {
        console.error("Error fetching school:", error);
        return NextResponse.json(
            { error: "Failed to fetch school" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: any
) {
    try {
        const id = parseInt(params.id);
        const school = await getSchoolById(id);
        
        if (!school) {
            return NextResponse.json(
                { error: "School not found" },
                { status: 404 }
            );
        }
        
        const data = await request.json();
        
        // Update address if provided
        if (data.address) {
            // First get the address to verify it exists
            const address = await getAddressById(school.address_id);
            if (!address) {
                return NextResponse.json(
                    { error: "Address not found" },
                    { status: 404 }
                );
            }
            
            await updateAddress(school.address_id, data.address);
        }
        
        // Update school details
        const updatedSchool = await updateSchool(id, {
            name: data.name,
            is_ATL: data.is_ATL,
            in_charge: data.in_charge ? JSON.stringify(data.in_charge) : Prisma.JsonNull,
            correspondent: data.correspondent ? JSON.stringify(data.correspondent) : Prisma.JsonNull,
            principal: data.principal ? JSON.stringify(data.principal) : Prisma.JsonNull,
            syllabus: data.syllabus,
            website_url: data.website_url,
            paid_subscription: data.paid_subscription,
            social_links: data.social_links
        });
        
        return NextResponse.json(updatedSchool);
    } catch (error) {
        console.error("Error updating school:", error);
        return NextResponse.json(
            { error: "Failed to update school" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: any
) {
    try {
        const id = parseInt(params.id);
        const school = await getSchoolById(id);
        
        if (!school) {
            return NextResponse.json(
                { error: "School not found" },
                { status: 404 }
            );
        }
        
        // Delete the school using the CRUD function
        await deleteSchool(id);
        
        // Then delete the associated address
        await deleteAddress(school.address_id);
        
        return NextResponse.json({ message: "School deleted successfully" });
    } catch (error) {
        console.error("Error deleting school:", error);
        return NextResponse.json(
            { error: "Failed to delete school" },
            { status: 500 }
        );
    }
}