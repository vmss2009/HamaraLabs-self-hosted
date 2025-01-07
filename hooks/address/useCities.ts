'use client';

import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import { State, City } from "@/lib/db/address/types/address";

export const useCities = () => {
    const [cities, setCities] = useState<City[]>([]);

    const getCities = async (stateId: State["id"]) => {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('city')
            .select('*')
            .eq('state', stateId);
        console.log(data);
        if (data) {
            setCities(data);
        }
    };

    return {
        cities,
        getCities
    };
};