"use client";

import React, { useState, useEffect } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Checkbox } from "../ui/Checkbox";
import { Card, CardContent } from "../ui/Card";
import { SchoolFilter as SchoolFilterType } from "@/lib/db/school/type";

interface SchoolFilterProps {
  onFilter: (filters: SchoolFilterType) => void;
}

const SchoolFilter: React.FC<SchoolFilterProps> = ({ onFilter }) => {
  const [countries, setCountries] = useState<
    { id: number; country_name: string }[]
  >([]);
  const [states, setStates] = useState<{ id: number; state_name: string }[]>(
    []
  );
  const [cities, setCities] = useState<{ id: number; city_name: string }[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<number | null>(null);
  const [selectedState, setSelectedState] = useState<number | null>(null);
  const [filters, setFilters] = useState<SchoolFilterType>({
    name: "",
    is_ATL: undefined,
    paid_subscription: undefined,
    cityId: undefined,
    stateId: undefined,
    countryId: undefined,
  });

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch("/api/countries");
        const data = await response.json();
        setCountries(data);
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    };

    fetchCountries();
  }, []);

  useEffect(() => {
    if (selectedCountry) {
      const fetchStates = async () => {
        try {
          const response = await fetch(
            `/api/states?countryId=${selectedCountry}`
          );
          const data = await response.json();
          setStates(data);
        } catch (error) {
          console.error("Error fetching states:", error);
        }
      };

      fetchStates();
    } else {
      setStates([]);
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedState) {
      const fetchCities = async () => {
        try {
          const response = await fetch(`/api/cities?stateId=${selectedState}`);
          const data = await response.json();
          setCities(data);
        } catch (error) {
          console.error("Error fetching cities:", error);
        }
      };

      fetchCities();
    } else {
      setCities([]);
    }
  }, [selectedState]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      setFilters({ ...filters, [name]: checked });
    } else {
      setFilters({ ...filters, [name]: value || undefined });
    }
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryId = e.target.value ? parseInt(e.target.value) : undefined;
    setSelectedCountry(countryId || null);
    setSelectedState(null);
    setFilters({
      ...filters,
      countryId,
      stateId: undefined,
      cityId: undefined,
    });
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stateId = e.target.value ? parseInt(e.target.value) : undefined;
    setSelectedState(stateId || null);
    setFilters({
      ...filters,
      stateId,
      cityId: undefined,
    });
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityId = e.target.value ? parseInt(e.target.value) : undefined;
    setFilters({
      ...filters,
      cityId,
    });
  };

  const handleATLChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    setFilters({
      ...filters,
      is_ATL: checked === true ? true : undefined,
    });
  };

  const handlePaidSubscriptionChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { checked } = e.target;
    setFilters({
      ...filters,
      paid_subscription: checked === true ? true : undefined,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter(filters);
  };

  const handleReset = () => {
    setFilters({
      name: "",
      is_ATL: undefined,
      paid_subscription: undefined,
      cityId: undefined,
      stateId: undefined,
      countryId: undefined,
    });
    setSelectedCountry(null);
    setSelectedState(null);
    onFilter({});
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="School Name"
              name="name"
              value={filters.name || ""}
              onChange={handleInputChange}
              placeholder="Search by name"
            />
            <Select
              label="Country"
              options={[
                { value: "", label: "All Countries" },
                ...countries.map((country) => ({
                  value: country.id,
                  label: country.country_name,
                })),
              ]}
              onChange={handleCountryChange}
              value={filters.countryId?.toString() || ""}
            />
            <Select
              label="State"
              options={[
                { value: "", label: "All States" },
                ...states.map((state) => ({
                  value: state.id,
                  label: state.state_name,
                })),
              ]}
              onChange={handleStateChange}
              value={filters.stateId?.toString() || ""}
              disabled={!selectedCountry}
            />
            <Select
              label="City"
              options={[
                { value: "", label: "All Cities" },
                ...cities.map((city) => ({
                  value: city.id,
                  label: city.city_name,
                })),
              ]}
              onChange={handleCityChange}
              value={filters.cityId?.toString() || ""}
              disabled={!selectedState}
            />
          </div>
          <div className="flex flex-wrap gap-6">
            <Checkbox
              label="ATL Schools Only"
              name="is_ATL"
              checked={filters.is_ATL === true}
              onChange={handleATLChange}
            />
            <Checkbox
              label="Paid Subscription Only"
              name="paid_subscription"
              checked={filters.paid_subscription === true}
              onChange={handlePaidSubscriptionChange}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button type="submit">Apply Filters</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SchoolFilter;
