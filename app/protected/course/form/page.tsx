"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button"; 
import FormSection from "@/components/forms/FormSection";

export default function CourseRegistrationForm() {

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [organizedBy, setOrganizedBy] = useState("");
  const [applicationStartDate, setApplicationStartDate] = useState("");
  const [applicationEndDate, setApplicationEndDate] = useState("");
  const [courseStartDate, setCourseStartDate] = useState("");
  const [courseEndDate, setCourseEndDate] = useState("");
  const [eligibilityFrom, setEligibilityFrom] = useState("");
  const [eligibilityTo, setEligibilityTo] = useState("");
  const [referenceLink, setReferenceLink] = useState("");

  const formatDate = (dateString: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toISOString();
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const courseData = {
        name,
        description,
        organized_by: organizedBy,
        application_start_date: formatDate(applicationStartDate),
        application_end_date: formatDate(applicationEndDate),
        course_start_date: formatDate(courseStartDate),
        course_end_date: formatDate(courseEndDate),
        eligibility_from: eligibilityFrom,
        eligibility_to: eligibilityTo,
        reference_link: referenceLink,
      };

      console.log("Submitted Course Data:", courseData);
      // API submission can be added here

    } 
  
    catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred");
      }
    }

    finally {
      setIsLoading(false);
    }
  };

  return (
    
   <div className="w-screen flex justify-center items-center bg-slate-400">
  {error && (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 animate-pulse">
      {error}
    </div>
  )}

  <form
    onSubmit={onSubmit}
    className="w-full ml-10 mr-10 md:ml-0 md:mr-0 md:w-1/2 mx-auto my-12 px-8 py-10 bg-blue-50 text-gray-800 shadow-2xl rounded-3xl space-y-10 border border-gray-200"
  >
    <h2 className="text-4xl font-extrabold text-center text-indigo-700 mb-6">
      Course Registration
    </h2>

    {/* Basic Info */}
    <FormSection title="Basic Information">
      <div className="rounded-2xl pb-10 border border-gray-200 bg-white/70 shadow p-6 space-y-6">
        <h3 className="text-2xl font-semibold text-indigo-600 border-b pb-2">Basic Information</h3>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">Course Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Enter course name"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            placeholder="Enter description"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none"
          ></textarea>
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">Organized By</label>
          <select
            value={organizedBy}
            onChange={(e) => setOrganizedBy(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl"
          >
            <option value="">Select</option>
            <option value="university">University</option>
            <option value="company">Company</option>
            <option value="organization">Organization</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Application Start Date</label>
            <input
              type="date"
              value={applicationStartDate}
              onChange={(e) => setApplicationStartDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Application End Date</label>
            <input
              type="date"
              value={applicationEndDate}
              onChange={(e) => setApplicationEndDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Course Start Date</label>
            <input
              type="date"
              value={courseStartDate}
              onChange={(e) => setCourseStartDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Course End Date</label>
            <input
              type="date"
              value={courseEndDate}
              onChange={(e) => setCourseEndDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl"
            />
          </div>
        </div>
      </div>
    </FormSection>

    {/* Eligibility */}
    <FormSection title="Eligibility">
      <div className="rounded-2xl border border-gray-200 bg-white/70 shadow p-6">
        <h3 className="text-2xl font-semibold text-indigo-600 border-b pb-2 mb-6">Eligibility</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-3">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">From</label>
            <select
              value={eligibilityFrom}
              onChange={(e) => setEligibilityFrom(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl"
            >
              <option value="">Select</option>
              <option value="10th">10th</option>
              <option value="12th">12th</option>
              <option value="graduate">Graduate</option>
            </select>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">To</label>
            <select
              value={eligibilityTo}
              onChange={(e) => setEligibilityTo(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl"
            >
              <option value="">Select</option>
              <option value="12th">12th</option>
              <option value="graduate">Graduate</option>
              <option value="postgraduate">Postgraduate</option>
            </select>
          </div>
        </div>
      </div>
    </FormSection>

    {/* Reference Link */}
    <FormSection title="Reference">
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-700">Reference Link</label>
        <input
          type="url"
          value={referenceLink}
          onChange={(e) => setReferenceLink(e.target.value)}
          required
          placeholder="Enter reference link"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl"
        />
      </div>
    </FormSection>

    {/* Submit */}
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
);
}
