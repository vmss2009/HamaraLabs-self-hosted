'use client';

import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import { Topic, Subtopic } from "@/lib/db/subject/types/subject";

export const useSubTopics = () => {
    const [subTopics, setSubTopics] = useState<Subtopic[]>([]);

    const getSubTopics = async (topicId: Topic["id"]) => {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('sub_topic')
            .select('*')
            .eq('topic', topicId);
        console.log(data);
        if (data) {
            setSubTopics(data);
        }
    };

    return {
        subTopics,
        getSubTopics
    };
};