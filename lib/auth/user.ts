'use server';

import { createClient } from "@/utils/supabase/server";

export const createUserUsingMagicLink = async (email: string, metaData: object) => {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {data: metaData});
    if (error) throw error;

    return data;
}

export const getUserById = async (userId: string) => {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.admin.getUserById(userId);

    if (error) {
        console.error('Error fetching user:', error);
        throw error;
    }

    return data; // Return the user data
};