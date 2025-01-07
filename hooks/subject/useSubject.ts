'use client';

import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import { Subject } from "@/lib/db/subject/types/subject";

export const useSubjects = () => {
    const [subjects, setSubjects] = useState<Subject[]>([]);

    const getSubjects = async () => {
        const supabase = await createClient();
        const { data, error } = await supabase.from("subject").select();
        console.log(data);
        if (data) {
            setSubjects(data);
        }
    };

    return {
        subjects,
        getSubjects
    };
};