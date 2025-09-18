"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import { Button } from "@/components/form/Button";
import FormSection from "@/components/form/FormSection";
import TextFieldGroup from "@/components/form/TextFieldGroup";
import CheckboxGroup from "@/components/form/CheckboxGroup";
import RadioButtonGroup from "@/components/form/RadioButtonGroup";
import DynamicFieldArray from "@/components/form/DynamicFieldArray";
import MultipleUserInput from "@/components/form/MultipleUserInput";
import { useRouter } from "next/navigation";

interface UserData {
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
}

type Country = {
  id: number;
  country_name: string;
};

type State = {
  id: number;
  state_name: string;
  countryId: number;
};

type City = {
  id: number;
  city_name: string;
  stateId: number;
};

export default function EditSchoolForm({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [syllabus, setSyllabus] = useState<string[]>([]);
  const [socialLinks, setSocialLinks] = useState<string[]>([""]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [inCharges, setInCharges] = useState<UserData[]>([{
    email: "",
    first_name: "",
    last_name: "",
    phone_number: "",
  }]);
  const [principals, setPrincipals] = useState<UserData[]>([]);
  const [correspondents, setCorrespondents] = useState<UserData[]>([]);

  const [isATL, setIsATL] = useState<string>("No");
  const [establishmentyear, setEstablishmentyear] = useState<string>("");
  const [paidSubscription, setPaidSubscription] = useState<string>("No");

  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");

  useEffect(() => {
    const fetchSchoolData = async () => {
      try {
        const response = await fetch(`/api/schools/${resolvedParams.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch school data");
        }
        const data = await response.json();

        setIsATL(data.is_ATL ? "Yes" : "No");
        setEstablishmentyear(data.ATL_establishment_year?.toString() || "");
        setPaidSubscription(data.paid_subscription ? "Yes" : "No");
        setSyllabus(data.syllabus || []);

        const socialLinksData = data.social_links || [];
        setSocialLinks(socialLinksData.length > 0 ? socialLinksData : [""]);

        setSelectedCountry(data.address.city.state.country_id.toString());

        const statesResponse = await fetch(
          `/api/states?countryId=${data.address.city.state.country_id}`
        );
        const statesData = await statesResponse.json();
        setStates(statesData);
        setSelectedState(data.address.city.state_id.toString());

        const citiesResponse = await fetch(
          `/api/cities?stateId=${data.address.city.state.id}`
        );
        const citiesData = await citiesResponse.json();
        setCities(citiesData);
        setSelectedCity(data.address.city.id.toString());

        // Fetch users and classify by rolesBySchool metadata
        const usersResp = await fetch(`/api/schools/${resolvedParams.id}/users`);
        const users = usersResp.ok ? await usersResp.json() : [];

        const schoolId = String(resolvedParams.id);
        const inChargeUsers: UserData[] = [];
        const principalUsers: UserData[] = [];
        const correspondentUsers: UserData[] = [];

        users.forEach((user: any) => {
          const entry: UserData = {
            email: user.email,
            first_name: user.first_name || "",
            last_name: user.last_name || "",
            phone_number: user.user_meta_data?.phone_number || "",
          };
          const rolesBySchool = user.user_meta_data?.rolesBySchool || {};
          const roles = rolesBySchool[schoolId] || [];
          const arr = Array.isArray(roles) ? roles : [roles];
          arr.forEach((r: string) => {
            const role = r?.toUpperCase?.();
            if (role === 'INCHARGE' || role === 'IN-CHARGE') inChargeUsers.push(entry);
            else if (role === 'PRINCIPAL') principalUsers.push(entry);
            else if (role === 'CORRESPONDENT') correspondentUsers.push(entry);
          });
        });

        setInCharges(inChargeUsers.length > 0 ? inChargeUsers : [{
          email: "",
          first_name: "",
          last_name: "",
          phone_number: "",
        }]);
        setPrincipals(principalUsers);
        setCorrespondents(correspondentUsers);
        
        // Set default form values
        setTimeout(() => {
          const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement;
          const udiseCodeInput = document.querySelector('input[name="udiseCode"]') as HTMLInputElement;
          const addressLine1Input = document.querySelector('input[name="addressLine1"]') as HTMLInputElement;
          const addressLine2Input = document.querySelector('input[name="addressLine2"]') as HTMLInputElement;
          const pincodeInput = document.querySelector('input[name="pincode"]') as HTMLInputElement;
          const websiteInput = document.querySelector('input[name="websiteURL"]') as HTMLInputElement;
          
          if (nameInput) nameInput.value = data.name;
          if (udiseCodeInput) udiseCodeInput.value = data.udise_code || '';
          if (addressLine1Input) addressLine1Input.value = data.address.address_line1 || '';
          if (addressLine2Input) addressLine2Input.value = data.address.address_line2 || '';
          if (pincodeInput) pincodeInput.value = data.address.pincode || '';
          if (websiteInput) websiteInput.value = data.website_url || '';
        }, 100);
      } catch (error) {
        setError("Error loading school data. Please try again.");
        console.error(error);
      }
    };

    fetchSchoolData();
  }, [resolvedParams.id]);

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

  const handleSocialLinkChange = (index: number, value: string) => {
    const updatedLinks = [...socialLinks];
    updatedLinks[index] = value;
    setSocialLinks(updatedLinks);
  };

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, ""]);
  };

  const removeSocialLink = (index: number) => {
    const updatedLinks = [...socialLinks];
    updatedLinks.splice(index, 1);
    setSocialLinks(updatedLinks);
  };


  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(event.target as HTMLFormElement);

      if (isATL === "Yes") {
        const year = formData.get("ATL_establishment_year");
        if (
          !year ||
          (typeof year === "string" &&
            (!/^\d{4}$/.test(year) || parseInt(year) < 2000))
        ) {
          throw new Error(
            "Please enter a valid 4-digit year from 2000 onwards"
          );
        }
      }

      // Validate that at least one in-charge is provided
      const validInCharges = inCharges.filter(user => 
        user.email.trim() !== "" && 
        user.first_name.trim() !== "" && 
        user.last_name.trim() !== ""
      );
      
      if (validInCharges.length === 0) {
        throw new Error("At least one in-charge is required");
      }

      // Validate no duplicate emails within each role
      const validateEmailDuplicates = (users: typeof inCharges, roleName: string) => {
        const emails = users
          .filter(user => user.email.trim() !== "")
          .map(user => user.email.toLowerCase().trim());
        const uniqueEmails = new Set(emails);
        if (uniqueEmails.size !== emails.length) {
          throw new Error(`Duplicate emails found among ${roleName}. Each ${roleName.slice(0, -1)} must have a unique email.`);
        }
      };

      validateEmailDuplicates(validInCharges, "in-charges");
      const validPrincipals = principals.filter(user => 
        user.email.trim() !== "" && 
        user.first_name.trim() !== "" && 
        user.last_name.trim() !== ""
      );
      validateEmailDuplicates(validPrincipals, "principals");
      const validCorrespondents = correspondents.filter(user => 
        user.email.trim() !== "" && 
        user.first_name.trim() !== "" && 
        user.last_name.trim() !== ""
      );
      validateEmailDuplicates(validCorrespondents, "correspondents");

      const schoolData = {
        name: formData.get("name"),
        udise_code: formData.get("udiseCode") || undefined,
        is_ATL: isATL === "Yes",
        ATL_establishment_year:
          isATL === "Yes"
            ? parseInt(formData.get("ATL_establishment_year") as string)
            : null,
        address: {
          address_line1: formData.get("addressLine1"),
          address_line2: formData.get("addressLine2"),
          pincode: formData.get("pincode"),
          cityId: parseInt(selectedCity),
        },
        in_charges: validInCharges.map(user => ({
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          user_meta_data: {
            phone_number: user.phone_number || "",
          },
        })),
        correspondents: validCorrespondents.map(user => ({
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          user_meta_data: {
            phone_number: user.phone_number || "",
          },
        })),
        principals: validPrincipals.map(user => ({
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          user_meta_data: {
            phone_number: user.phone_number || "",
          },
        })),
        syllabus,
        website_url: formData.get("websiteURL"),
        paid_subscription: paidSubscription === "Yes",
        social_links: socialLinks.filter((link) => link.trim() !== ""),
      };

      const response = await fetch(`/api/schools/${resolvedParams.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(schoolData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update school data");
      }

      window.location.href = "/protected/school/report";
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred");
      }
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const countryOptions = countries.map((country) => ({
    value: country.id.toString(),
    label: country.country_name,
  }));

  const stateOptions = Array.isArray(states)
    ? states.map((state) => ({
        value: state.id.toString(),
        label: state.state_name,
      }))
    : [];

  const cityOptions = Array.isArray(cities)
    ? cities.map((city) => ({
        value: city.id.toString(),
        label: city.city_name,
      }))
    : [];

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
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Edit school</h1>
          <p className="text-gray-600">Update the school information below</p>
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
                    {
                      name: "udiseCode",
                      label: "UDISE Code",
                      required: false,
                      placeholder: "Enter UDISE code (optional)",
                    },
                  ]}
                />
              </div>

              <div className="space-y-4">
                <RadioButtonGroup
                  name="isATL"
                  legend="Is ATL?"
                  options={yesNoOptions}
                  value={isATL}
                  onChange={setIsATL}
                />

                {isATL === "Yes" && (
                  <TextFieldGroup
                    fields={[
                      {
                        name: "ATL_establishment_year",
                        label: "ATL Establishment Year",
                        required: true,
                        placeholder: "Enter year (e.g., 2024)",
                        type: "number",
                        value: establishmentyear,
                        onChange: (e) => setEstablishmentyear(e.target.value),
                      },
                    ]}
                  />
                )}
              </div>
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

              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 font-semibold text-gray-700">Country *</label>
                    <select 
                      value={selectedCountry}
                      onChange={handleCountryChange}
                      required
                      className="w-full p-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="">Select Country</option>
                      {countryOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 font-semibold text-gray-700">State *</label>
                    <select 
                      value={selectedState}
                      onChange={handleStateChange}
                      required
                      disabled={!selectedCountry}
                      className={`w-full p-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                        !selectedCountry ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <option value="">Select State</option>
                      {stateOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 font-semibold text-gray-700">City *</label>
                    <select 
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      required
                      disabled={!selectedState}
                      className={`w-full p-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                        !selectedState ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <option value="">Select City</option>
                      {cityOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
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
            </div>
          </FormSection>

          <FormSection
            title="In-Charge Details"
            description="Add one or more in-charge persons (at least one is required)"
          >
            <MultipleUserInput
              title="In-Charges"
              description="At least one in-charge is required"
              users={inCharges}
              onChange={setInCharges}
              required={true}
              minUsers={1}
            />
          </FormSection>

          <FormSection
            title="Principal Details"
            description="Add principals for the school (optional)"
          >
            <MultipleUserInput
              title="Principals"
              description="Add school principals (optional)"
              users={principals}
              onChange={setPrincipals}
              required={false}
              minUsers={0}
            />
          </FormSection>

          <FormSection
            title="Correspondent Details"
            description="Add correspondents for the school (optional)"
          >
            <MultipleUserInput
              title="Correspondents"
              description="Add school correspondents (optional)"
              users={correspondents}
              onChange={setCorrespondents}
              required={false}
              minUsers={0}
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

              <DynamicFieldArray
                values={socialLinks}
                placeholder="SocialLink"
                onChange={handleSocialLinkChange}
                onAdd={addSocialLink}
                onRemove={removeSocialLink}
                legend="Social Links"
                fieldLabel="Social Link"
              />
            </div>
          </FormSection>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              className="px-8 py-3 font-semibold rounded-full shadow-lg hover:from-purple-600 hover:to-indigo-700 transition"
              onClick={() => router.push("/protected/school/report")}
              variant="outline"
              size="lg"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              isLoading={isLoading}
              size="lg"
              className="px-8 py-3 font-semibold bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full shadow-lg hover:from-purple-600 hover:to-indigo-700 transition"
            >
              Update
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
