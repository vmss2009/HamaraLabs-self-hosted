"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import FormSection from "@/components/forms/FormSection";
import SelectField from "@/components/forms/SelectField";
import { Input } from "@/components/ui/Input";
import { SchoolVisitWithRelations } from "@/lib/db/school-visits/type";
import { SchoolWithAddress } from "@/lib/db/school/type";
import { User } from "@prisma/client";

interface DetailItem {
  key: string;
  value: string;
  isFixed?: boolean;
}

export default function EditSchoolVisitForm({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [schools, setSchools] = useState<SchoolWithAddress[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [schoolUsers, setSchoolUsers] = useState<User[]>([]);
  const [details, setDetails] = useState<DetailItem[]>([{ key: "", value: "" }]);
  const [isOtherPOC, setIsOtherPOC] = useState(false);
  const [formData, setFormData] = useState({
    school_id: "",
    visit_date: "",
    poc_id: "",
    other_poc: "",
    uc_submissions: "",
    planned_showcase_date: "",
    school_performance: "",
  });

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

  useEffect(() => {
    const fetchSchoolVisit = async () => {
      try {
        const response = await fetch(`/api/school-visits/${resolvedParams.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch school visit");
        }
        const data: SchoolVisitWithRelations = await response.json();
        
        setSelectedSchool(data.school_id);
        setFormData({
          school_id: data.school_id,
          visit_date: new Date(data.visit_date).toISOString().split('T')[0],
          poc_id: data.poc_id || "",
          other_poc: data.other_poc || "",
          uc_submissions: (data.details as Record<string, any>)?.["No of UCs submitted"] || "",
          planned_showcase_date: (data.details as Record<string, any>)?.["Planned showcase date"] || "",
          school_performance: data.school_performance || "",
        });
        setIsOtherPOC(!data.poc_id && !!data.other_poc);

        // Set additional details
        const additionalDetails = Object.entries(data.details as Record<string, any>)
          .filter(([key]) => key !== "No of UCs submitted" && key !== "Planned showcase date")
          .map(([key, value]) => ({ key, value: value.toString() }));
        
        setDetails(additionalDetails.length > 0 ? additionalDetails : [{ key: "", value: "" }]);
      } catch (error) {
        console.error("Error fetching school visit:", error);
        setError("Failed to load school visit data");
      }
    };
    fetchSchoolVisit();
  }, [resolvedParams.id]);

  useEffect(() => {
    const fetchSchoolUsers = async () => {
      if (selectedSchool) {
        try {
          const response = await fetch(`/api/users?school_id=${selectedSchool}`);
          if (!response.ok) {
            throw new Error("Failed to fetch school users");
          }
          const data = await response.json();
          setSchoolUsers(data);
        } catch (error) {
          console.error("Error fetching school users:", error);
        }
      }
    };
    fetchSchoolUsers();
  }, [selectedSchool]);

  const handleSchoolChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedSchool(value);
    setFormData(prev => ({ ...prev, school_id: value, poc_id: "" }));
    setSchoolUsers([]);
  };

  const handlePOCChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setIsOtherPOC(value === "other");
    setFormData(prev => ({ 
      ...prev, 
      poc_id: value,
      other_poc: value === "other" ? "" : prev.other_poc 
    }));
  };

  const handleDetailChange = (index: number, field: "key" | "value", value: string) => {
    const newDetails = [...details];
    newDetails[index][field] = value;
    setDetails(newDetails);
  };

  const addDetailField = () => {
    setDetails([...details, { key: "", value: "" }]);
  };

  const removeDetailField = (index: number) => {
    setDetails(details.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Create a Map to maintain order
      const detailsMap = new Map();
      
      // Add fixed fields first
      detailsMap.set("No of UCs submitted", formData.uc_submissions);
      detailsMap.set("Planned showcase date", formData.planned_showcase_date);
      
      // Add additional details
      details.forEach(({ key, value }) => {
        if (key && value) {
          detailsMap.set(key, value);
        }
      });

      // Convert Map to object while preserving order
      const detailsObject = Object.fromEntries(detailsMap);

      const data = {
        ...formData,
        details: detailsObject,
      };

      const response = await fetch(`/api/school-visits/${resolvedParams.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update the form");
      }

      router.push("/protected/sarthi");
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
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Edit School Visit</h1>
          <p className="text-gray-600 mt-2">Update the school visit details below.</p>
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

        <form onSubmit={handleSubmit} className="space-y-8">
          <FormSection title="Basic Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
              <div className="w-full md:col-span-2">
                <SelectField
                  name="school"
                  label="School"
                  value={formData.school_id}
                  onChange={handleSchoolChange}
                  options={schools.map(school => ({
                    value: school.id,
                    label: school.name
                  }))}
                  placeholder="Select a school"
                  required
                />
              </div>

              <div className="w-full">
                <Input
                  type="date"
                  label="Visit Date"
                  value={formData.visit_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, visit_date: e.target.value }))}
                  required
                  className="focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="w-full">
                <SelectField
                  name="poc"
                  label="Point of Contact"
                  value={formData.poc_id}
                  onChange={handlePOCChange}
                  options={[
                    ...schoolUsers.map(user => ({
                      value: user.id,
                      label: `${user.first_name} ${user.last_name}`
                    })),
                    { value: "other", label: "Other" }
                  ]}
                  placeholder="Select POC"
                  required
                />
              </div>

              {isOtherPOC && (
                <div className="w-full">
                  <Input
                    type="text"
                    label="Other POC Name"
                    value={formData.other_poc}
                    onChange={(e) => setFormData(prev => ({ ...prev, other_poc: e.target.value }))}
                    required
                    className="focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              )}

              <div className="w-full">
                <Input
                  label="No of UCs submitted"
                  placeholder="Enter a number (eg. 1, 2)"
                  value={formData.uc_submissions}
                  onChange={(e) => setFormData(prev => ({ ...prev, uc_submissions: e.target.value }))}
                  required
                  className="focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="w-full">
                <Input
                  type="date"
                  label="Planned showcase date"
                  value={formData.planned_showcase_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, planned_showcase_date: e.target.value }))}
                  required
                  className="focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div className="w-full">
                <SelectField
                  name="school_performance"
                  label="School Performance"
                  value={formData.school_performance}
                  onChange={(e) => setFormData(prev => ({ ...prev, school_performance: e.target.value }))}
                  options={[
                    { value: "Good performing", label: "Good performing" },
                    { value: "Medium performing", label: "Medium performing" },
                    { value: "Bad performing", label: "Bad performing" }
                  ]}
                  placeholder="Select performance"
                  required
                />
              </div>
            </div>
          </FormSection>

          <FormSection title="Additional Details">
            <div className="space-y-4">
              {details.map((detail, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="flex-1">
                    <Input
                      label="Key"
                      value={detail.key}
                      onChange={(e) => handleDetailChange(index, "key", e.target.value)}
                      placeholder="Enter key"
                      className="focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      label="Value"
                      value={detail.value}
                      onChange={(e) => handleDetailChange(index, "value", e.target.value)}
                      placeholder="Enter value"
                      className="focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex gap-2 mt-8">
                    {index === details.length - 1 && (
                      <button
                        type="button"
                        onClick={addDetailField}
                        className="text-white bg-green-500 hover:bg-green-600 px-3 py-1 rounded-full font-bold"
                        aria-label="Add"
                      >
                        +
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => removeDetailField(index)}
                      className="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded-full font-bold"
                      aria-label="Remove"
                    >
                      −
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </FormSection>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              onClick={() => router.push("/protected/sarthi")}
              variant="outline"
              size="lg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
              size="lg"
            >
              Update
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 