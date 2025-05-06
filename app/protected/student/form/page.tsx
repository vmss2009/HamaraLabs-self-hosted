"use client";

import { useState, useEffect } from "react";
import TextFieldGroup from "@/app/components/forms/TextFieldGroup";
import { Button } from "@/components/ui/Button";
import FormSection from "@/components/forms/FormSection";
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
    <div className="flex items-center justify-center w-screen min-h-screen bg-gradient-to-br from-blue-200 via-blue-300 to-teal-400">
      <div className="m-10 w-full max-w-3xl p-8 bg-white bg-opacity-70 backdrop-blur-md rounded-2xl shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl pb-3 font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Student Registration
          </h1>
          <p className="mt-2 text-gray-700">
            Fill out the form below to register a new student.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-8">
          {/* School Selection */}
          <FormSection title="School Information">
            <SelectField
              label="Select School"
              name="school"
              options={
                schools.map((school) => ({
                  value: school.id.toString(),
                  label: school.name,
                }))
              }
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              required
              className="w-full px-4 py-2rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
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
                { name: "comments", label: "Comments", required: false,multiline:true, rows:3 }

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
              className="mt-5"
             
            />
            <div className="flex justify-end mt-6">
              <Button
                type="submit"
                isLoading={isLoading}
                size="lg"
                className="px-8 py-3 font-semibold bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full shadow-lg hover:from-purple-600 hover:to-indigo-700 transition"
              >
                Submit
              </Button>
            </div>
          </FormSection>
        </form>
      </div>
    </div>
  );
}
