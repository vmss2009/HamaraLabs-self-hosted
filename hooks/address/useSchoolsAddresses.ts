'use client';

import { createClient } from "@/utils/supabase/client";
import { useState } from "react";

export const useSchoolsAddresses = () => {
    const [schoolsAddresses, setSchoolsAddresses] = useState<{label: string, id: number}[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const getSchoolsAddresses = async () => {
        setLoading(true);

        const supabase = await createClient();
        const {data, error} = await supabase.from("school").select(
            `id, name, address, address (
                *, city (
                    *, state (
                        *, country (*)
                    )
                )
            )`
        );

        if (data) {
            console.log(data);
            const schoolsAddresses = data.map((school) => ({
                id: school.id,
                label: `${school.name}, ${school.address.address_line1}, ${school.address.address_line2}, ${school.address.city.city_name}, ${school.address.city.state.state_name}, ${school.address.city.state.country.country_name}, PINCODE - ${school.address.pincode}`,
            }));
            setSchoolsAddresses(schoolsAddresses);
        }
        setLoading(false);
    }
    return {
        schoolsAddresses,
        loading,
        getSchoolsAddresses
    };
};