'use server';

import { createClient } from '@/utils/supabase/server';
import { School } from '@/lib/db/school/types/school'

export const addSchool = async (dataToSubmit: School) => {
    const supabase = await createClient();

    const { data, error } = await supabase.from("school").insert([dataToSubmit]).select();
    if (error) throw error;

    return data;
};