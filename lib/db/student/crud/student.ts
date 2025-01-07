'use server';

import { createClient } from '@/utils/supabase/server';
import { Student } from '@/lib/db/student/types/student'

export const addStudent = async (dataToSubmit: Student) => {
    const supabase = await createClient();

    const { data, error } = await supabase.from("student").insert([dataToSubmit]).select();
    if (error) throw error;

    return data;
};