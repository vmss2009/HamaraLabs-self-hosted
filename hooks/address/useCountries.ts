'use client';

import { createClient } from "@/utils/supabase/client";
import { useState } from "react";
import { Country } from "@/lib/db/address/types/address";

export const useCountries = () => {
  const [countries, setCountries] = useState<Country[]>([]);

  const getCountries = async () => {
    const supabase = await createClient();
    const { data, error } = await supabase.from("country").select();
    console.log(data);
    if (data) {
        setCountries(data);
    }
  };

  return {
    countries,
    getCountries
  };
};