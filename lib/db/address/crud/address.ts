'use server';

import { createClient } from '@/utils/supabase/server';
import { Address } from '@/lib/db/address/types/address'

export const addAddress = async (dataToSubmit: Address) => {
    const supabase = await createClient();

    const { data, error } = await supabase.from("address").insert([dataToSubmit]).select();
    if (error) throw error;

    return data;
};