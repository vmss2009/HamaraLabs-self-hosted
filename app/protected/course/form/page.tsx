"use client";

import { useState } from "react";
import React, { ChangeEvent } from "react";
import { Button } from "@/components/Button";
import FormSection from "@/components/FormSection";
import { useRouter } from "next/navigation";
import MultiForm from "@/components/Multiform";
import DateFieldGroup from "@/components/DateField";
import { Input } from "@/components/Input";

export default function CourseForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [organizedBy, setOrganizedBy] = useState("");
  const [requirements, setRequirements] = useState([""]);
  const [courseTags, setCourseTags] = useState([""]);

  const [isExternal, setIsExternal] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const courseData = {
        name: formData.get("name"),
        description: formData.get("description"),
        organized_by: organizedBy,
        application_start_date: formData.get("applicationStartDate"),
        application_end_date: formData.get("applicationEndDate"),
        course_start_date: formData.get("courseStartDate"),
        course_end_date: formData.get("courseEndDate"),
        eligibility_from: formData.get("eligibilityFrom"),
        eligibility_to: formData.get("eligibilityTo"),
        reference_link: formData.get("referenceLink"),
        requirements,
        course_tags: courseTags,
      };

      const response = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(courseData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit the form");
      }
      router.push("/protected/course/report");
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

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "External") {
      setIsExternal(true);
      setOrganizedBy("");
    } else {
      setIsExternal(false);
      setOrganizedBy(val);
    }
  };

  return (
    <div className="flex items-center justify-center w-screen min-h-screen bg-slate-400">
      <div className="m-10 w-full max-w-3xl p-8 bg-white bg-opacity-70 backdrop-blur-md rounded-2xl shadow-2xl">
        <div className="mb-3 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h1 className="text-3xl font-bold text-blue-800 mb-2">
            Course Registration
          </h1>
          <p className="text-gray-600">
            Fill out the form below to register your course
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

        <form onSubmit={onSubmit} className="space-y-8 text-black">
          <FormSection title="Basic Information">
            <div className=" space-y-6">
              <div>
                <Input
                  id="course-name"
                  name="name"
                  label="Course Name"
                  setvalue={setOrganizedBy}
                  required
                  placeholder="Enter course name"
                  className="focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-bold text-gray-700">
                  Description <span className="text-red-600">*</span>
                </label>
                <textarea
                  required
                  name="description"
                  rows={4}
                  placeholder="Enter description"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none"
                ></textarea>
              </div>

              <div>
                <label className="block mb-2 text-sm font-bold text-gray-700">
                  Organized By <span className="text-red-600">*</span>
                </label>

                <select
                  required
                  value={isExternal ? "External" : organizedBy}
                  onChange={handleSelectChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                >
                  <option value="">Select</option>
                  <option value="AIM">AIM</option>
                  <option value="External">External</option>
                </select>

                {isExternal && (
                  <Input
                    type="text"
                    name="organizedby"
                    id="organizedby"
                    value={organizedBy}
                    onChange={(e) => setOrganizedBy(e.target.value)}
                    placeholder="Enter external organizer name"
                    className="w-full  px-4 py-3 border border-gray-300 rounded-xl"
                    required
                  />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                  <DateFieldGroup name="applicationStartDate" required />
                </div>
                <div>
                  <DateFieldGroup name="applicationEndDate" required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                  <DateFieldGroup name="courseStartDate" required />
                </div>

                <div>
                  <DateFieldGroup name="courseEndDate" required />
                </div>
              </div>
            </div>
          </FormSection>

          <FormSection title="Eligibility">
            <div className="">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-3">
                <div>
                  <label className="block mb-2 text-sm font-bold text-gray-700">
                    From <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="eligibilityFrom"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                    required
                  >
                    <option value="">Select</option>
                    <option value="6th">6th</option>
                    <option value="7th">7th</option>
                    <option value="8th">8th</option>
                    <option value="9th">9th</option>
                    <option value="10th">10th</option>
                    <option value="11th">11th</option>
                    <option value="12th">12th</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-bold text-gray-700">
                    To <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="eligibilityTo"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                    required
                  >
                    <option value="">Select</option>
                    <option value="6th">6th</option>
                    <option value="7th">7th</option>
                    <option value="8th">8th</option>
                    <option value="9th">9th</option>
                    <option value="10th">10th</option>
                    <option value="11th">11th</option>
                    <option value="12th">12th</option>
                  </select>
                </div>
              </div>
            </div>
          </FormSection>

          <FormSection title="Requirements & Tags">
            <div className="">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <MultiForm
                    placeholder="Requirement"
                    className="space-y-4"
                    values={requirements}
                    setArray={setRequirements}
                    legend="Requirements"
                    fieldLabel="Requirement"
                    name="requirements"
                  />
                </div>

                <div>
                  <MultiForm
                    placeholder="Tag"
                    className="space-y-4"
                    values={courseTags}
                    setArray={setCourseTags}
                    legend="Course Tags"
                    fieldLabel="Tag"
                    name="courseTags"
                  />
                </div>
              </div>
            </div>
          </FormSection>

          <FormSection title="Reference">
            <div>
              <label className="block mb-2 text-sm font-bold text-gray-700">
                Reference Link
              </label>
              <input
                type="url"
                name="referenceLink"
                placeholder="Enter reference link"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl"
              />
            </div>
          </FormSection>

          <div className="flex justify-end w-full">
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
