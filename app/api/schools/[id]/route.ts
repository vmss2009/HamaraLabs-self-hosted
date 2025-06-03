import { NextRequest, NextResponse } from "next/server";
import { getSchoolById, updateSchool, deleteSchool } from "@/lib/db/school/crud";
import { deleteAddress } from "@/lib/db/address/crud";

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
        
        const updatedSchool = await updateSchool(id, {
            name: data.name,
            is_ATL: data.is_ATL,
            syllabus: data.syllabus,
            website_url: data.website_url,
            paid_subscription: data.paid_subscription,
            social_links: data.social_links,
            address: data.address,
            correspondent: data.correspondent,
            principal: data.principal,
            in_charge: data.in_charge
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
        
        await deleteSchool(id);
        
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