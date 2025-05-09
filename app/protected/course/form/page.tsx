"use client";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRef, useState } from "react";


export default function CourseRegistrationForm() {
  const formRef = useRef<HTMLFormElement>(null);

  // For handling date pickers (we still need local state here)
  const [dates, setDates] = useState({
    applicationStartDate: null as Date | null,
    applicationEndDate: null as Date | null,
    courseStartDate: null as Date | null,
    courseEndDate: null as Date | null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);

    const courseData = {
      name: formData.get("name"),
      description: formData.get("description"),
      organizedBy: formData.get("organizedBy"),
      applicationStartDate: dates.applicationStartDate?.toISOString().split("T")[0],
      applicationEndDate: dates.applicationEndDate?.toISOString().split("T")[0],
      courseStartDate: dates.courseStartDate?.toISOString().split("T")[0],
      courseEndDate: dates.courseEndDate?.toISOString().split("T")[0],
      eligibilityFrom: formData.get("eligibilityFrom"),
      eligibilityTo: formData.get("eligibilityTo"),
      referenceLink: formData.get("referenceLink"),
    };

    console.log(courseData);
  };

  return (
    <div className="w-screen flex justify-center items-center bg-slate-400">

   
    <form
      ref={formRef}
      onSubmit={handleSubmit}
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
          <textarea name="description" required rows={4} placeholder="Enter description" className="w-full px-4 py-3 border border-gray-300 rounded-xl"></textarea>
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
            <DatePicker
              selected={dates.applicationStartDate}
              onChange={(date) => setDates((prev) => ({ ...prev, applicationStartDate: date }))}
              placeholderText="Select date"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Application End Date</label>
            <DatePicker
              selected={dates.applicationEndDate}
              onChange={(date) => setDates((prev) => ({ ...prev, applicationEndDate: date }))}
              placeholderText="Select date"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Course Start Date</label>
            <DatePicker
              selected={dates.courseStartDate}
              onChange={(date) => setDates((prev) => ({ ...prev, courseStartDate: date }))}
              placeholderText="Select date"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Course End Date</label>
            <DatePicker
              selected={dates.courseEndDate}
              onChange={(date) => setDates((prev) => ({ ...prev, courseEndDate: date }))}
              placeholderText="Select date"
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
