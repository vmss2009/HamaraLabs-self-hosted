'use client';

import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import { School } from "@/lib/db/school/types/school";
import { getUserById } from "@/lib/auth/user";

export const useSchools = () => {
    const [schools, setSchools] = useState<School[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const getSchools = async () => {
        setLoading(true);
        const supabase = await createClient();

        // Fetch all school data (remove pagination)
        const { data, error } = await supabase
            .from("school")
            .select(`*, address (
                *, city (
                    *, state (
                        *, country (*)
                    )
                )
            )`) // Include principal details

        if (data) {
            const schoolsWithSerial = await Promise.all(
                data.map(async (school, index) => {
                    const principalUser = school.principal ? await getUserById(school.principal) : null;
                    const principalEmail = principalUser?.user.email || "N/A";
                    const principalFirstName = principalUser?.user.user_metadata.firstName || "N/A";
                    const principalLastName = principalUser?.user.user_metadata.lastName || "N/A";
                    const principalNumber = principalUser?.user.user_metadata.whatsapp || "N/A";

                    const correspondentUser = school.correspondent ? await getUserById(school.correspondent) : null;
                    const correspondentEmail = correspondentUser?.user.email || "N/A";
                    const correspondentFirstName = correspondentUser?.user.user_metadata.firstName || "N/A";
                    const correspondentLastName = correspondentUser?.user.user_metadata.lastName || "N/A";
                    const correspondentNumber = correspondentUser?.user.user_metadata.whatsapp || "N/A";

                    const inChargeUser = school.in_charge ? await getUserById(school.in_charge) : null;
                    const inChargeEmail = inChargeUser?.user.email || "N/A";
                    const inChargeFirstName = inChargeUser?.user.user_metadata.firstName || "N/A";
                    const inChargeLastName = inChargeUser?.user.user_metadata.lastName || "N/A";
                    const inChargeNumber = inChargeUser?.user.user_metadata.whatsapp || "N/A";

                    return {
                        ...school,
                        addressLine1: school.address.address_line1,
                        addressLine2: school.address.address_line2,
                        pincode: school.address.pincode,
                        city: school.address.city.city_name,
                        state: school.address.city.state.state_name,
                        country: school.address.city.state.country.country_name,
                        principalEmail,
                        principalFirstName,
                        principalLastName,
                        principalNumber,
                        correspondentEmail,
                        correspondentFirstName,
                        correspondentLastName,
                        correspondentNumber,
                        inChargeEmail,
                        inChargeFirstName,
                        inChargeLastName,
                        inChargeNumber,
                        serial: index + 1, // Serial number for each row
                    };
                })
            );

            setSchools(schoolsWithSerial);
        }
        setLoading(false);
    };

    return {
        schools,
        loading,
        getSchools,
    };
};