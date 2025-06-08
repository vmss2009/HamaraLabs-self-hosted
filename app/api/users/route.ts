import { NextResponse } from "next/server";
import { getUsersBySchool } from "@/lib/db/auth/user";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const school_id = searchParams.get("school_id");

        if (!school_id) {
            return NextResponse.json(
                { error: "School ID is required" },
                { status: 400 }
            );
        }

        const users = await getUsersBySchool(parseInt(school_id));
        return NextResponse.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json(
            { error: "Failed to fetch users" },
            { status: 500 }
        );
    }
} 