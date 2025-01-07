'use client';

import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import { Student } from "@/lib/db/student/types/student";

export const useStudents = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const getStudents = async () => {
        setLoading(true);
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('student')
            .select('*, school(*)');

        if (data) {
            const studentsWithSchoolInfo = data.map((student, index) => ({
                ...student,
                serial: index + 1,
                schoolName: student.school?.name,
            }));
            setStudents(studentsWithSchoolInfo);
        }
        setLoading(false);
    };

    return {
        students,
        loading,
        getStudents
    };
};