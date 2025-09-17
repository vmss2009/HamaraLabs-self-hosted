"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import FormSection from "@/components/FormSection";
import { Input } from "@/components/Input";
import { Autocomplete, TextField, Chip } from "@mui/material";
import { MentorUpdateInput } from "@/lib/db/mentor/type";

type School = {
  id: string;
  name: string;
};

export default function EditMentorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formSubmitted, setFormSubmitted] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const schoolsResponse = await fetch("/api/schools");
        if (!schoolsResponse.ok) {
          throw new Error("Failed to fetch schools");
        }
        const schoolsData = await schoolsResponse.json();
        setSchools(schoolsData);

        const mentorResponse = await fetch(`/api/mentors/${resolvedParams.id}`);
        if (!mentorResponse.ok) {
          throw new Error("Failed to fetch mentor data");
        }
        const mentor = await mentorResponse.json();

        setFirstName(mentor.first_name || "");
        setLastName(mentor.last_name || "");
        setEmail(mentor.email || "");
        setPhoneNumber(mentor.phone_number || "");
        setSelectedSchools(mentor.school_ids || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data. Please try again later.");
      }
    };

    fetchData();
  }, [resolvedParams.id]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setFormSubmitted(true);

    try {
      const updateData: MentorUpdateInput = {
        first_name: firstName,
        last_name: lastName,
        email,
        phone_number: phoneNumber,
        school_ids: selectedSchools,
      };

      const response = await fetch(`/api/mentors/${resolvedParams.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error("Failed to update mentor");
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
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Edit Mentor</h1>
          <p className="text-gray-600 mt-2">
            Update the mentor&apos;s information below.
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
                id="schools-autocomplete-edit"
                options={schools}
                getOptionLabel={(option) => option.name}
                value={schools.filter((school) => selectedSchools.includes(school.id))}
                onChange={(event, newValue) => {
                  setSelectedSchools(newValue.map((school) => school.id));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Schools *"
                    placeholder="Select schools"
                    variant="outlined"
                    fullWidth
                    error={formSubmitted && selectedSchools.length === 0}
                    helperText={
                      formSubmitted && selectedSchools.length === 0
                        ? "Please select at least one school"
                        : undefined
                    }
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                      },
                      '& .MuiInputLabel-root': {
                        color: '#1f2937',
                        fontWeight: 600,
                      },
                      '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#3b82f6',
                      },
                      '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#3b82f6',
                      },
                    }}
                  />
                )}
                renderTags={(tagValue, getTagProps) =>
                  tagValue.map((option, index) => (
                    <Chip
                      label={option.name}
                      {...getTagProps({ index })}
                      key={option.id}
                      sx={{
                        backgroundColor: '#e0e7ff',
                        color: '#3730a3',
                        '& .MuiChip-deleteIcon': {
                          color: '#3730a3',
                        },
                      }}
                    />
                  ))
                }
                sx={{
                  '& .MuiAutocomplete-popupIndicator': {
                    color: '#6b7280',
                  },
                }}
              />
            </div>
          </FormSection>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              className="px-8 py-3 font-semibold rounded-full shadow-lg hover:from-purple-600 hover:to-indigo-700 transition"
              onClick={() => router.push("/protected/mentor/report")}
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
