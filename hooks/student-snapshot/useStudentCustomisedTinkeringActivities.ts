'use client';

import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import { TinkeringActivity } from "@/lib/db/tinkering-activity/types/tinkeringActivity";
import { Student } from "@/lib/db/student/types/student";

export const useStudentCustomisedTinkeringActivities = () => {
    const [customisedTinkeringActivities, setCustomisedTinkeringActivities] = useState<TinkeringActivity[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const getStudentCustomisedTinkeringActivities = async (studentId: number) => {
        setLoading(true);

        const supabase = await createClient();

        const { data: studentData, error: studentError } = await supabase.from("student").select().eq("id", studentId).single();

        if (studentError) {
            console.error("Error fetching student data:", studentError);
            setLoading(false);
            return;
        }

        const { data, error } = await supabase
            .from('customised_ta')
            .select(`*, ta(
                *, sub_topic (
                    *, topic (
                        *, subject (*)
                    )
                )
            )`)
            .eq('user_id', (studentData as Student).student);

        if (error) {
            console.error("Error fetching customised tinkering activities:", error);
            setLoading(false);
            return;
        }

        if (data && data.length > 0 && data[0].ta) {
            const customisedTinkeringActivitiesWithInformation = data.map((customisedTinkeringActivity, index) => {
                return {
                    ...customisedTinkeringActivity.ta,
                    serial: index + 1,
                    subject: customisedTinkeringActivity.ta.sub_topic.topic.subject.subject,
                    topic: customisedTinkeringActivity.ta.sub_topic.topic.topic,
                    subTopic: customisedTinkeringActivity.ta.sub_topic.sub_topic,
                }
            });
            setCustomisedTinkeringActivities(customisedTinkeringActivitiesWithInformation);
        } else {
            console.log("No customised tinkering activities found.");
            setCustomisedTinkeringActivities([]);
        }

        setLoading(false);
    };

    return {
        customisedTinkeringActivities,
        loading,
        getStudentCustomisedTinkeringActivities
    };
};