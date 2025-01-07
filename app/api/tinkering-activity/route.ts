import { z } from "zod";
import { NextResponse } from "next/server";
import { addTinkeringActivity } from "@/lib/db/tinkering-activity/crud/tinkeringActivity";
import {TinkeringActivity} from "@/lib/db/tinkering-activity/types/tinkeringActivity"; // Updated import path

// Schema for the tinkering activity form
const schema = z.object({
    sub_topic: z.number().refine(value => !isNaN(value) && value !== null),
    name: z.string().nonempty(),
    introduction: z.string().nonempty(),
    goals: z.array(z.string().nonempty()).optional(),
    materials: z.array(z.string().nonempty()).optional(),
    instructions: z.array(z.string().nonempty()).optional(),
    tips: z.array(z.string().nonempty()).optional(),
    observations: z.array(z.string().nonempty()).optional(),
    extensions: z.array(z.string().nonempty()).optional(),
    resources: z.array(z.string().nonempty()).optional(),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validatedData = schema.parse(body);

        const tinkeringActivityData: TinkeringActivity = {
            sub_topic: validatedData.sub_topic,
            name: validatedData.name,
            introduction: validatedData.introduction,
            goals: validatedData.goals || [],
            materials: validatedData.materials || [],
            instructions: validatedData.instructions || [],
            tips: validatedData.tips || [],
            observations: validatedData.observations || [],
            extensions: validatedData.extensions || [],
            resources: validatedData.resources || [],
            type: "default"
        };

        // Store the tinkering activity in the database
        await addTinkeringActivity(tinkeringActivityData);

        return NextResponse.json({ message: "Tinkering activity submitted successfully!" });
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