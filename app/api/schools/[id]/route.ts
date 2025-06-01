import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getSchoolById, updateSchool, deleteSchool } from "@/lib/db/school/crud";
import { getAddressById, updateAddress, deleteAddress } from "@/lib/db/address/crud";
import { Prisma } from "@prisma/client";
import { v4 as uuidv4 } from 'uuid';

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

        // Handle correspondent user creation/update
        let correspondentId = undefined;
        if (data.correspondent) {
            // Check if correspondent email matches principal email
            const principal = school.users?.find(user => user.id === school.principal_id);
            const currentCorrespondent = school.users?.find(user => user.id === school.correspondent_id);

            if (data.correspondent.email === principal?.email) {
                // If emails match, use principal's ID
                correspondentId = principal?.id;
            } else if (data.correspondent.email !== currentCorrespondent?.email) {
                // If email is different from current correspondent, create new user
                const newCorrespondent = await prisma.user.create({
                    data: {
                        id: uuidv4(),
                        email: data.correspondent.email,
                        first_name: data.correspondent.first_name,
                        last_name: data.correspondent.last_name,
                        user_meta_data: data.correspondent.user_meta_data
                    }
                });
                correspondentId = newCorrespondent.id;
            } else {
                // Update existing correspondent
                await prisma.user.update({
                    where: { id: currentCorrespondent?.id },
                    data: {
                        first_name: data.correspondent.first_name,
                        last_name: data.correspondent.last_name,
                        user_meta_data: data.correspondent.user_meta_data
                    }
                });
                correspondentId = currentCorrespondent?.id;
            }
        }
        
        // Update school details
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