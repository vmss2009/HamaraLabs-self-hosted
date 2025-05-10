"use client";

import { useRef, useState } from "react";

export default function CourseRegistrationForm() {
  const formRef = useRef<HTMLFormElement>(null);

  // For handling date pickers (we still need local state here)
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [applicationStartDate, setApplicationStartDate] = useState("");
  const [applicationEndDate, setApplicationEndDate] = useState("");
  const [courseStartDate, setCourseStartDate] = useState("");
  const [courseEndDate, setCourseEndDate] = useState("");


  const onsubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formatDate = (dateString: string) => {
      if (!dateString) return null;
      // Create a date object and convert to ISO string
      const date = new Date(dateString);
      return date.toISOString();
    };

    try {
      if (!formRef.current) throw new Error("Form reference is not available.");

      const formData = new FormData(formRef.current);

      const courseData = {
        name: formData.get("name"),
        description: formData.get("description"),
        organizedBy: formData.get("organizedBy"),
        application_start_date: formatDate(applicationStartDate),
        application_end_date: formatDate(applicationEndDate),
        courseStartDate: formatDate(courseStartDate),
        courseEndDate:  formatDate(courseEndDate),
        eligibilityFrom: formData.get("eligibilityFrom"),
        eligibilityTo: formData.get("eligibilityTo"),
        referenceLink: formData.get("referenceLink"),
      };

      console.log(courseData);
      // Submit data here (e.g., API call)

    } catch (err: any) {
      console.error("Submission error:", err);
      setError("Something went wrong during submission. Please check your input.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-screen flex justify-center items-center bg-slate-400">


      <form
        ref={formRef}
        onSubmit={onsubmit}
        className="w-full ml-10 mr-10 md:ml-0 md:mr-0  md:w-1/2   mx-auto my-12 px-8 py-10 bg-blue-50 text-gray-800 shadow-2xl rounded-3xl space-y-10 border border-gray-200"
      >
        <h2 className="text-4xl font-extrabold text-center text-indigo-700 mb-6">
          Course Registration
        </h2>

        {/* Basic Info */}
        <div className="rounded-2xl pb-10 border border-gray-200 bg-white/70 shadow p-6 space-y-6">
          <h3 className="text-2xl font-semibold text-indigo-600 border-b pb-2">Basic Information</h3>

          <div>
            <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-700">Course Name</label>
            <input type="text" name="name" required placeholder="Enter course name" className="w-full px-4 py-3 border border-gray-300 rounded-xl" />
          </div>

          <div>
            <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-700">Description</label>
            <textarea name="description" required rows={4} placeholder="Enter description" className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none"></textarea>
          </div>

          <div>
            <label htmlFor="organizedBy" className="block mb-2 text-sm font-medium text-gray-700">Organized By</label>
            <select name="organizedBy" required className="w-full px-4 py-3 border border-gray-300 rounded-xl">
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

        {/* Eligibility */}
        <div className="rounded-2xl border border-gray-200 bg-white/70 shadow p-6">
          <h3 className="text-2xl font-semibold text-indigo-600 border-b pb-2 mb-6">Eligibility</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-3">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">From</label>
              <select name="eligibilityFrom" className="w-full px-4 py-3 border border-gray-300 rounded-xl">
                <option value="">Select</option>
                <option value="10th">10th</option>
                <option value="12th">12th</option>
                <option value="graduate">Graduate</option>
              </select>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">To</label>
              <select name="eligibilityTo" className="w-full px-4 py-3 border border-gray-300 rounded-xl">
                <option value="">Select</option>
                <option value="12th">12th</option>
                <option value="graduate">Graduate</option>
                <option value="postgraduate">Postgraduate</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reference Link */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">Reference Link</label>
          <input
            type="url"
            name="referenceLink"
            required
            placeholder="Enter reference link"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl"
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end w-full">
          <button type="submit" className="px-8 py-3 font-semibold bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full shadow-lg hover:from-purple-600 hover:to-indigo-700 transition">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
