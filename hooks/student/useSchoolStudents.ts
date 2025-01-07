'use client';

import { createClient } from "@/utils/supabase/client";
import { useState } from "react";

export const useSchoolStudents = () => {
    const [students, setStudents] = useState<{label: string, id: number}[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const getSchoolStudents = async (schoolId: number) => {
        setLoading(true);
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('student')
            .select('*, school(*)')
            .eq('school', schoolId);

        if (data) {
            console.log(data);
            const studentsWithSchoolInfo = data.map((student) => ({
                id: student.id,
                label: `${student.first_name} ${student.last_name}`,
            }));
            setStudents(studentsWithSchoolInfo);
        }
        setLoading(false);
    };

    return {
        students,
        loading,
        getSchoolStudents
    };
};
