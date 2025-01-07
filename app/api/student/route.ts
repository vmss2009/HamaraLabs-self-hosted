import { z } from "zod";
import { NextResponse } from "next/server";
import { addStudent } from "@/lib/db/student/crud/student";
import type { Student } from "@/lib/db/student/types/student";
import { createUserUsingMagicLink } from "@/lib/auth/user";

const schema = z.object({
    school: z.number().refine(value => !isNaN(value) && value !== null),
    firstName: z.string().nonempty(),
    lastName: z.string().nonempty(),
    gender: z.enum(["Male", "Female", "Other"]),
    email: z.string().email(),
    class: z.string().nonempty(),
    section: z.string().nonempty(),
    aspiration: z.string().nonempty(),
    comments: z.string().optional(),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validatedData = schema.parse(body);

        const studentData: Omit<Student, "id" | "created_at"> = {
            school: validatedData.school,
            first_name: validatedData.firstName,
            last_name: validatedData.lastName,
            email: validatedData.email,
            class: validatedData.class,
            gender: validatedData.gender,
            section: validatedData.section,
            aspiration: validatedData.aspiration,
            comments: validatedData.comments,
        };

        const studentInvite = await createUserUsingMagicLink(validatedData.email, {
            role: "student",
            firstName: validatedData.firstName,
            lastName: validatedData.lastName,
        });

        studentData.student = studentInvite.user.id;

        await addStudent(studentData);

        return NextResponse.json({ message: "Student form submitted successfully!" });
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