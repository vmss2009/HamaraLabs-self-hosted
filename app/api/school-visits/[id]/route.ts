import { NextResponse } from "next/server";
import { getSchoolVisitById, updateSchoolVisit, deleteSchoolVisit } from "@/lib/db/school-visits/crud";
import { SchoolVisitUpdateInput, schoolVisitSchema } from "@/lib/db/school-visits/type";

export async function GET(request: Request, { params }: any) {
    try {
        const visit = await getSchoolVisitById(params.id);
        
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

export async function PUT(request: Request, { params }: any) {

    try {
        const visit = await getSchoolVisitById(params.id);
        
        if (!visit) {
            return NextResponse.json(
                { error: "School visit not found" },
                { status: 404 }
            );
        }
        
        const body = await request.json();
        const result = schoolVisitSchema.partial().safeParse(body);
        if (!result.success) {
            const errorMessages = result.error.errors.map((err) => err.message);
            console.error("Validation failed:", errorMessages);
            return NextResponse.json({ error: errorMessages[0] }, { status: 400 });
        }

        const updatedData: SchoolVisitUpdateInput = {
            school_id: body.school_id,
            visit_date: new Date(body.visit_date),
            poc_id: body.poc_id === "other" ? null : body.poc_id,
            other_poc: body.other_poc,
            school_performance: body.school_performance,
            details: body.details,
        };

        const updatedVisit = await updateSchoolVisit(params.id, updatedData);

        return NextResponse.json(updatedVisit);
    } catch (error) {
        console.error("Error updating school visit:", error);
        return NextResponse.json(
            { error: "Failed to update school visit" },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request, { params }: any) {
    try {
        const visit = await getSchoolVisitById(params.id);
        
        if (!visit) {
            return NextResponse.json(
                { error: "School visit not found" },
                { status: 404 }
            );
        }
        
        await deleteSchoolVisit(params.id);
        return NextResponse.json({ message: "School visit deleted successfully" });
    } catch (error) {
        console.error("Error deleting school visit:", error);
        return NextResponse.json(
            { error: "Failed to delete school visit" },
            { status: 500 }
        );
    }
} 