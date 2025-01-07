import { School } from "@/lib/db/school/types/school";

export type Student = {
    id?: number;
    created_at?: string;
    first_name: string;
    last_name: string;
    aspiration: string;
    gender: string;
    email?: string;
    class: string;
    section: string;
    comments?: string;
    school: School["id"];
    student?: string;
}