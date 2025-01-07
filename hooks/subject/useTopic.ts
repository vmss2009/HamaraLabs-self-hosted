'use client';

import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import { Subject, Topic } from "@/lib/db/subject/types/subject";

export const useTopics = () => {
    const [topics, setTopics] = useState<Topic[]>([]);

    const getTopics = async (subjectId: Subject["id"]) => {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('topic')
            .select('*')
            .eq('subject', subjectId);
        console.log(data);
        if (data) {
            setTopics(data);
        }
    };

    return {
        topics,
        getTopics
    };
};