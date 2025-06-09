import { NextResponse } from "next/server";
import { createSchoolVisit, getSchoolVisits } from "@/lib/db/school-visits/crud";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const school_id = searchParams.get("school_id");
        const visit_date = searchParams.get("visit_date");
        const poc_id = searchParams.get("poc_id");

        const filter = {
            school_id: school_id || undefined,
            visit_date: visit_date ? new Date(visit_date) : undefined,
            poc_id: poc_id || undefined,
        };

        const visits = await getSchoolVisits(filter);
        return NextResponse.json(visits);
    } catch (error) {
        console.error("Error fetching school visits:", error);
        return NextResponse.json(
            { error: "Failed to fetch school visits" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const visit = await createSchoolVisit({
            school_id: body.school_id,
            visit_date: new Date(body.visit_date),
            poc_id: body.poc_id === "other" ? null : body.poc_id,
            other_poc: body.other_poc,
            school_performance: body.school_performance,
            details: body.details,
        });

        return NextResponse.json(visit);
    } catch (error) {
        console.error("Error creating school visit:", error);
        return NextResponse.json(
            { error: "Failed to create school visit" },
            { status: 500 }
        );
    }
} 