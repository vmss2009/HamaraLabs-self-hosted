"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import FormSection from "@/components/forms/FormSection";
import { Input } from "@/components/ui/Input";
import { Autocomplete, Box, Checkbox, TextField } from "@mui/material";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import CheckBoxIcon from "@mui/icons-material/CheckBox";

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

type School = {
  id: number;
  name: string;
};

export default function MentorForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State to track if form has been submitted
  const [formSubmitted, setFormSubmitted] = useState(false);

  // State for form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchools, setSelectedSchools] = useState<number[]>([]);

  // Fetch schools on component mount
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await fetch("/api/schools");
        if (!response.ok) {
          throw new Error("Failed to fetch schools");
        }
        const data = await response.json();
        setSchools(data);
      } catch (error) {
        console.error("Error fetching schools:", error);
        setError("Failed to load schools. Please try again later.");
      }
    };

    fetchSchools();
  }, []);

  // Form submission handler
  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setFormSubmitted(true); // Set formSubmitted to true on submission attempt

    try {
      const mentorData = {
        first_name: firstName,
        last_name: lastName,
        email,
        user_meta_data: {
          phone_number: phoneNumber,
        },
        school_ids: selectedSchools,
      };

      const response = await fetch("/api/mentors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mentorData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit the form");
      }

      router.push("/protected/mentor/report");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-screen min-h-screen bg-slate-400">
      <div className="m-10 w-full max-w-3xl p-8 bg-white bg-opacity-70 backdrop-blur-md rounded-2xl shadow-2xl">
        <div className="mb-3 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h1 className="text-3xl font-bold text-blue-800 mb-2">
            Mentor Registration
          </h1>
          <p className="text-gray-600 mt-2">
            Fill out the form below to register as a mentor.
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

        <form onSubmit={onSubmit} className="space-y-8">
          <FormSection title="Personal Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
              <div className="w-full">
                <Input
                  name="firstName"
                  label="First Name"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="w-full">
                <Input
                  name="lastName"
                  label="Last Name"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="w-full">
                <Input
                  name="email"
                  label="Email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="w-full">
                <Input
                  name="phoneNumber"
                  label="Phone Number"
                  type="tel"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </FormSection>

          <FormSection title="School Selection">
            <div className="w-full">
              <Autocomplete
                multiple
                id="schools-select"
                options={schools}
                disableCloseOnSelect
                getOptionLabel={(option) => option.name}
                value={schools.filter((school) =>
                  selectedSchools.includes(school.id)
                )}
                onChange={(_, newValue) => {
                  setSelectedSchools(newValue.map((school) => school.id));
                }}
                renderOption={(props, option, { selected }) => {
                  const { key, ...otherProps } = props;
                  return (
                    <Box
                      component="li"
                      sx={{ "& > img": { mr: 2, flexShrink: 0 } }}
                      key={key}
                      {...otherProps}
                    >
                      <Checkbox
                        icon={icon}
                        checkedIcon={checkedIcon}
                        style={{ marginRight: 8 }}
                        checked={selected}
                      />
                      {option.name}
                    </Box>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Search schools..."
                    variant="outlined"
                    error={formSubmitted && selectedSchools.length === 0}
                    helperText={
                      formSubmitted && selectedSchools.length === 0
                        ? "Please select at least one school"
                        : ""
                    }
                  />
                )}
              />
            </div>
          </FormSection>

          <div className="flex justify-end">
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
