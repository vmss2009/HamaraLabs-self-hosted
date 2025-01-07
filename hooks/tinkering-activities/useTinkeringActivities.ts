'use client';

import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import { TinkeringActivity } from "@/lib/db/tinkering-activity/types/tinkeringActivity";

export const useTinkeringActivities = () => {
    const [tinkeringActivities, setTinkeringActivities] = useState<TinkeringActivity[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const getTinkeringActivities = async () => {
        setLoading(true);
        const supabase = await createClient();

        // Fetch all school data (remove pagination)
        const { data, error } = await supabase
            .from("tinkering_activity")
            .select(`*, sub_topic (
                *, topic (
                    *, subject (*)
                )
            )`)
            .eq("type", "default");

        if (data) {
            const tinkeringActivities = data.map((school, index) => {
                return {
                    ...school,
                    serial: index + 1,
                    subject: school.sub_topic.topic.subject.subject,
                    topic: school.sub_topic.topic.topic,
                    subTopic: school.sub_topic.sub_topic,
                };
            });

            console.log(tinkeringActivities);

            setTinkeringActivities(tinkeringActivities);
        }
        setLoading(false);
    };

    return {
        tinkeringActivities,
        loading,
        getTinkeringActivities,
    };
};