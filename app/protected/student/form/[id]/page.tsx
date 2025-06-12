"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import { Button } from "@/components/ui/Button";
import FormSection from "@/components/forms/FormSection";
import TextFieldGroup from "@/components/forms/TextFieldGroup";
import SelectField from "@/components/forms/SelectField";
import RadioButtonGroup from "@/components/forms/RadioButtonGroup";
import { useRouter } from "next/navigation";

export default function EditStudentForm({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [schools, setSchools] = useState<Array<{ id: number; name: string }>>(
    []
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedSchool, setSelectedSchool] = useState<string>("");
  const [gender, setGender] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const schoolsResponse = await fetch("/api/schools");
        if (!schoolsResponse.ok) {
          throw new Error("Failed to fetch schools");
        }
        const schoolsData = await schoolsResponse.json();
        setSchools(schoolsData);

        const studentResponse = await fetch(
          `/api/students/${resolvedParams.id}`
        );
        if (!studentResponse.ok) {
          throw new Error("Failed to fetch student data");
        }
        const studentData = await studentResponse.json();
        console.log("Student data", studentData);

        setSelectedSchool(studentData.school_id.toString());
        setGender(studentData.gender);

        const form = document.querySelector("form") as HTMLFormElement;
        if (form) {
          form.firstName.value = studentData.first_name;
          form.lastName.value = studentData.last_name;
          form.email.value = studentData.email;
          form.class.value = studentData.class;
          form.section.value = studentData.section;
          form.aspiration.value = studentData.aspiration;
          form.comments.value = studentData.comments || "";
        }
      } catch (error) {
        setError("Error loading data. Please try again.");
        console.error(error);
      }
    };

    fetchData();
  }, [resolvedParams.id]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(event.target as HTMLFormElement);

      const studentData = {
        schoolId: selectedSchool.toString(),
        first_name: formData.get("firstName"),
        last_name: formData.get("lastName"),
        gender: formData.get("gender"),
        aspiration: formData.get("aspiration"),
        email: formData.get("email"),
        class: formData.get("class"),
        section: formData.get("section"),
        comments: formData.get("comments"),
      };

      const response = await fetch(`/api/students/${resolvedParams.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(studentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update student");
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
    <div className="flex items-center justify-center w-screen min-h-screen bg-slate-400">
      <div className="m-10 w-full max-w-3xl p-8 bg-white bg-opacity-70 backdrop-blur-md rounded-2xl shadow-2xl">
        <div className="mb-3 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h1 className="text-3xl font-bold text-blue-800 mb-2">
            Edit student form
          </h1>
          <p className="text-gray-600">Update the student information below</p>
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

          <FormSection title="Basic Information">
            <TextFieldGroup
              fields={[
                { name: "firstName", label: "First Name", required: true },
                { name: "lastName", label: "Last Name", required: true },
                {
                  name: "email",
                  label: "Email",
                  type: "email",
                  required: true,
                },
                { name: "class", label: "Class", required: true },
                { name: "section", label: "Section", required: true },
                { name: "aspiration", label: "Aspiration", required: true },
                {
                  name: "comments",
                  label: "Comments",
                  required: false,
                  multiline: true,
                  rows: 3,
                },
              ]}
            />
            <RadioButtonGroup
              legend="Gender"
              className="mt-4"
              name="gender"
              options={[
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "other", label: "Other" },
              ]}
              value={gender}
              onChange={(value) => setGender(value)}
              required
            />
          </FormSection>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              onClick={() => router.push("/protected/student/report")}
              variant="outline"
              size="lg"
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading} size="lg">
              Update Student
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
