import { NextResponse } from "next/server";
import { getSchoolVisitById, updateSchoolVisit, deleteSchoolVisit } from "@/lib/db/school-visits/crud";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);
        const visit = await getSchoolVisitById(id);
        
        if (!visit) {
            return NextResponse.json(
                { error: "School visit not found" },
                { status: 404 }
            );
        }
        
        return NextResponse.json(visit);
    } catch (error) {
        console.error("Error fetching school visit:", error);
        return NextResponse.json(
            { error: "Failed to fetch school visit" },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);
        const visit = await getSchoolVisitById(id);
        
        if (!visit) {
            return NextResponse.json(
                { error: "School visit not found" },
                { status: 404 }
            );
        }
        
        const body = await request.json();
        
        const updatedVisit = await updateSchoolVisit(id, {
            school_id: parseInt(body.school_id),
            visit_date: new Date(body.visit_date),
            poc_id: body.poc_id === "other" ? null : body.poc_id,
            other_poc: body.other_poc,
            school_performance: body.school_performance,
            details: body.details,
        });
        
        return NextResponse.json(updatedVisit);
    } catch (error) {
        console.error("Error updating school visit:", error);
        return NextResponse.json(
            { error: "Failed to update school visit" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id);
        const visit = await getSchoolVisitById(id);
        
        if (!visit) {
            return NextResponse.json(
                { error: "School visit not found" },
                { status: 404 }
            );
        }
        
        await deleteSchoolVisit(id);
        return NextResponse.json({ message: "School visit deleted successfully" });
    } catch (error) {
        console.error("Error deleting school visit:", error);
        return NextResponse.json(
            { error: "Failed to delete school visit" },
            { status: 500 }
        );
    }
} 