'use server';

import axios from "axios";

export const createUserUsingMagicLink = async (email: string, metaData: object) => {
    console.log(email, metaData);
    const response = await axios.post("http://192.168.0.109:7000/supabase-functions/create-user/magic-link", { email: email, metaData: metaData });

    console.log(response);

    const data = response.data.data;

    return data;
}

export const getUserById = async (userId: string) => {
    const response = await axios.post("http://192.168.0.109:7000/supabase-functions/get-user-details/", { id: userId });

    console.log(response);

    const data = response.data.data;

    return data;
};