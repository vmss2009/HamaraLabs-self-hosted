'use client';

import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import { Country, State } from "@/lib/db/address/types/address";

export const useStates = () => {
    const [states, setStates] = useState<State[]>([]);

    const getStates = async (countryId: Country["id"]) => {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('state')
            .select('*')
            .eq('country', countryId);
        console.log(data);
        if (data) {
            setStates(data);
        }
    };

    return {
        states,
        getStates
    };
};