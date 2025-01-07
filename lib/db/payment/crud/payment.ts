'use server';

import { createClient } from '@/utils/supabase/server';
import { Payment } from '@/lib/db/payment/types/payment'

export const addPayment = async (dataToSubmit: Payment) => {
    const supabase = await createClient();

    const { data, error } = await supabase.from("payment").insert([dataToSubmit]).select();
    if (error) throw error;

    return data;
};
