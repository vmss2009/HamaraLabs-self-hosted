"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import FormSection from "@/components/forms/FormSection";
import TextFieldGroup from "@/components/forms/TextFieldGroup";
import SelectField from "@/components/forms/SelectField";
import RadioButtonGroup from "@/components/forms/RadioButtonGroup";
import { useRouter } from "next/navigation";

export default function StudentForm() {
  const router = useRouter();
  const [schools, setSchools] = useState<Array<{ id: number; name: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedSchool, setSelectedSchool] = useState<string>("");
  const [gender, setGender] = useState<string>("");

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
      }
    };

    fetchSchools();
  }, []);

  // Form submission handler
  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(event.target as HTMLFormElement);
      
      const studentData = {
        schoolId: parseInt(selectedSchool),
        first_name: formData.get("firstName"),
        last_name: formData.get("lastName"),
        gender: formData.get("gender"),
        aspiration: formData.get("aspiration"),
        email: formData.get("email"),
        class: formData.get("class"),
        section: formData.get("section"),
        comments: formData.get("comments"),
      };

      const response = await fetch("/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(studentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit the form");
      }

      router.push("/protected/student/report");
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-200">
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Student Registration</h1>
          <p className="text-gray-600 mt-2">Fill out the form below to register a new student.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-8">
          {/* School Selection */}
          <FormSection title="School Information">
            <SelectField
              label="Select School"
              name="school"
              options={schools.map((school) => ({
                value: school.id.toString(),
                label: school.name,
              }))}
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              required
            />
          </FormSection>

          {/* Basic Information */}
          <FormSection title="Basic Information">
            <TextFieldGroup
              fields={[
                { name: "firstName", label: "First Name", required: true },
                { name: "lastName", label: "Last Name", required: true },
                { name: "email", label: "Email", type: "email", required: true },
                { name: "class", label: "Class", required: true },
                { name: "section", label: "Section", required: true },
                { name: "aspiration", label: "Aspiration", required: true },
                { name: "comments", label: "Comments", required: false }
              ]}
            />
            <RadioButtonGroup
              legend="Gender"
              name="gender"
              options={[
                { value: "Male", label: "Male" },
                { value: "Female", label: "Female" },
                { value: "Other", label: "Other" }
              ]}
              value={gender}
              onChange={(value) => setGender(value)}
              required
            />
          </FormSection>

          <div className="flex justify-end space-x-4">
            <Button
              type="submit"
              isLoading={isLoading}
              size="lg"
            >
              Submit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 