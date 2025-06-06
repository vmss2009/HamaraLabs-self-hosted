"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import FormSection from "@/components/FormSection";
import TextFieldGroup from "@/components/TextFieldGroup";
import SelectField from "@/components/SelectField";
import CheckboxGroup from "@/components/CheckboxGroup";
import RadioButtonGroup from "@/components/RadioButtonGroup";
import MultiForm from "@/components/Multiform";
import { Country, State, City } from "@/lib/db/location/type"

export default function SchoolForm() {
  const router = useRouter();

  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [syllabus, setSyllabus] = useState<string[]>([]);
  const [socialLinks, setSocialLinks] = useState<string[]>([""]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [isATL, setIsATL] = useState<string>("No");
  const [paidSubscription, setPaidSubscription] = useState<string>("No");

  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch("/api/countries");
        if (!response.ok) {
          throw new Error("Failed to fetch countries");
        }
        const data = await response.json();
        setCountries(data);
      } catch (error) {
        setError("Error loading countries. Please try again.");
        console.error(error);
      }
    };

    fetchCountries();
  }, []);

  const handleCountryChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const countryId = e.target.value;
    setSelectedCountry(countryId);

    try {
      const response = await fetch(`/api/states?countryId=${countryId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch states");
      }
      const data = await response.json();
      setStates(data);
      setCities([]);
      setSelectedState("");
      setSelectedCity("");
    } catch (error) {
      setError("Error loading states. Please try again.");
      console.error(error);
    }
  };

  const handleStateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stateId = e.target.value;
    setSelectedState(stateId);

    try {
      const response = await fetch(`/api/cities?stateId=${stateId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch cities");
      }
      const data = await response.json();
      setCities(data);
      setSelectedCity("");
    } catch (error) {
      setError("Error loading cities. Please try again.");
      console.error(error);
    }
  };

  const handleSyllabiChange = (value: string, checked: boolean) => {
    if (checked) {
      setSyllabus([...syllabus, value]);
    } else {
      setSyllabus(syllabus.filter((item) => item !== value));
    }
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(event.target as HTMLFormElement);

      const schoolData = {
        name: formData.get("name"),
        is_ATL: isATL === "Yes",
        address: {
          address_line1: formData.get("addressLine1"),
          address_line2: formData.get("addressLine2"),
          pincode: formData.get("pincode"),
          cityId: parseInt(selectedCity),
        },
        in_charge: {
          firstName: formData.get("inChargeFirstName"),
          lastName: formData.get("inChargeLastName"),
          email: formData.get("inChargeEmail"),
          whatsapp: formData.get("inChargeWhatsapp"),
        },
        correspondent: {
          firstName: formData.get("correspondentFirstName"),
          lastName: formData.get("correspondentLastName"),
          email: formData.get("correspondentEmail"),
          whatsapp: formData.get("correspondentWhatsapp"),
        },
        principal: {
          firstName: formData.get("principalFirstName"),
          lastName: formData.get("principalLastName"),
          email: formData.get("principalEmail"),
          whatsapp: formData.get("principalWhatsapp"),
        },
        syllabus,
        website_url: formData.get("websiteURL"),
        paid_subscription: paidSubscription === "Yes",
        social_links: socialLinks.filter((link) => link.trim() !== ""),
      };

      const response = await fetch("/api/schools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(schoolData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit school data");
      }

      router.push("/protected/competition/report");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
        console.log(error.message);
      } else {
        setError("An unexpected error occurred");
      }
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const sortedCountries = [...countries].sort((a, b) => {
    if (a.country_name === "India") return -1;
    if (b.country_name === "India") return 1;
    return 0;
  });

  const countryOptions = sortedCountries.map((country) => ({
    value: country.id.toString(),
    label: country.country_name,
  }));

  const stateOptions = states.map((state) => ({
    value: state.id.toString(),
    label: state.state_name,
  }));

  const cityOptions = cities.map((city) => ({
    value: city.id.toString(),
    label: city.city_name,
  }));

  const syllabusOptions = [
    { value: "CBSE", label: "CBSE" },
    { value: "State", label: "State" },
    { value: "ICSE", label: "ICSE" },
    { value: "IGCSE", label: "IGCSE" },
    { value: "IB", label: "IB" },
  ];

  const yesNoOptions = [
    { value: "Yes", label: "Yes" },
    { value: "No", label: "No" },
  ];

  return (
    <div className="flex items-center justify-center w-screen min-h-screen bg-slate-400">
      <div className="m-10 w-full max-w-3xl p-8 bg-white bg-opacity-70 backdrop-blur-md rounded-2xl shadow-2xl">
        <div className="mb-3 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h1 className="text-3xl font-bold text-blue-800 mb-2">
            School Registration
          </h1>
          <p className="text-gray-600">
            Fill out the form below to register a new school
          </p>
        </div>

        {error && (
          <div className="bg-red-50 flex gap-3 items-center text-red-500 p-4 rounded-md mb-3">
            <div className="flex-shrink-0">
              <svg
                className="w-6 h-6 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="text-sm">
              <p className="text-red-500">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-6">
          <FormSection
            title="Basic Information"
            description="Enter the basic details of the school"
          >
            <div className="space-y-4">
              <div className="w-full">
                <TextFieldGroup
                  fields={[
                    {
                      name: "name",
                      label: "School Name",
                      required: true,
                      placeholder: "Enter school name",
                    },
                  ]}
                />
              </div>

              <RadioButtonGroup
                name="isATL"
                legend="Is ATL?"
                options={yesNoOptions}
                value={isATL}
                onChange={setIsATL}
              />
            </div>
          </FormSection>

          <FormSection
            title="School Address"
            description="Enter the address details of the school"
          >
            <div className="space-y-5">
              <TextFieldGroup
                fields={[
                  {
                    name: "addressLine1",
                    label: "Address Line 1",
                    required: true,
                    placeholder: "Enter address line 1",
                  },
                  {
                    name: "addressLine2",
                    label: "Address Line 2",
                    placeholder: "Enter address line 2 (optional)",
                  },
                ]}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5 mb-5">
                <SelectField
                  name="country"
                  label="Country"
                  options={countryOptions}
                  value={selectedCountry}
                  onChange={handleCountryChange}
                  required
                />

                <SelectField
                  name="state"
                  label="State"
                  options={stateOptions}
                  value={selectedState}
                  onChange={handleStateChange}
                  required
                  className={
                    !selectedCountry ? "opacity-50 pointer-events-none" : ""
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
                <SelectField
                  name="city"
                  label="City"
                  options={cityOptions}
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  required
                  className={
                    !selectedState ? "opacity-50 pointer-events-none" : ""
                  }
                />

                <TextFieldGroup
                  fields={[
                    {
                      name: "pincode",
                      label: "Pincode",
                      required: true,
                      placeholder: "Enter pincode",
                    },
                  ]}
                />
              </div>
            </div>
          </FormSection>

          <FormSection
            title="In-Charge Details"
            description="Enter the details of the in-charge person (optional)"
          >
            <TextFieldGroup
              fields={[
                {
                  name: "inChargeFirstName",
                  label: "First Name",
                  placeholder: "Enter first name",
                },
                {
                  name: "inChargeLastName",
                  label: "Last Name",
                  placeholder: "Enter last name",
                },
                {
                  name: "inChargeEmail",
                  label: "Email",
                  type: "email",
                  placeholder: "Enter email address",
                },
                {
                  name: "inChargeWhatsapp",
                  label: "WhatsApp Number",
                  placeholder: "Enter WhatsApp number",
                },
              ]}
            />
          </FormSection>

          <FormSection
            title="Correspondent Details"
            description="Enter the details of the correspondent (optional)"
          >
            <TextFieldGroup
              fields={[
                {
                  name: "correspondentFirstName",
                  label: "First Name",
                  placeholder: "Enter first name",
                },
                {
                  name: "correspondentLastName",
                  label: "Last Name",
                  placeholder: "Enter last name",
                },
                {
                  name: "correspondentEmail",
                  label: "Email",
                  type: "email",
                  placeholder: "Enter email address",
                },
                {
                  name: "correspondentWhatsapp",
                  label: "WhatsApp Number",
                  placeholder: "Enter WhatsApp number",
                },
              ]}
            />
          </FormSection>

          <FormSection
            title="Principal Details"
            description="Enter the details of the principal (optional)"
          >
            <TextFieldGroup
              fields={[
                {
                  name: "principalFirstName",
                  label: "First Name",
                  placeholder: "Enter first name",
                },
                {
                  name: "principalLastName",
                  label: "Last Name",
                  placeholder: "Enter last name",
                },
                {
                  name: "principalEmail",
                  label: "Email",
                  type: "email",
                  placeholder: "Enter email address",
                },
                {
                  name: "principalWhatsapp",
                  label: "WhatsApp Number",
                  placeholder: "Enter WhatsApp number",
                },
              ]}
            />
          </FormSection>

          <FormSection
            title="Additional Information"
            description="Enter additional details about the school"
          >
            <div className="space-y-6">
              <CheckboxGroup
                options={syllabusOptions}
                legend="Syllabus"
                onChange={handleSyllabiChange}
                selectedValues={syllabus}
                className="mb-5"
              />

              <TextFieldGroup
                fields={[
                  {
                    name: "websiteURL",
                    label: "Website URL",
                    placeholder: "Enter website URL",
                  },
                ]}
              />

              <RadioButtonGroup
                name="paidSubscription"
                legend="Paid Subscription"
                options={yesNoOptions}
                value={paidSubscription}
                onChange={setPaidSubscription}
                className="mb-5"
              />

              <MultiForm
                className="space-y-4"
                placeholder="SocialLink"
                name="SocialLink"
                values={socialLinks}
                setArray={setSocialLinks}
                legend="Social Links"
                fieldLabel="Social Link"
              />
            </div>
          </FormSection>

          <div className="flex justify-end space-x-4">
            <Button
              type="submit"
              isLoading={isLoading}
              size="lg"
              className="px-8 py-3 font-semibold bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full shadow-lg hover:from-purple-600 hover:to-indigo-700 transition"
            >
              Submit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
