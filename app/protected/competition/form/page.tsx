"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import FormSection from "@/components/forms/FormSection";
import TextFieldGroup from "@/components/forms/TextFieldGroup";
import SelectField from "@/components/forms/SelectField";
import DynamicFieldArray from "@/components/forms/DynamicFieldArray";
import { Input } from "@/components/ui/Input";

export default function CompetitionForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // State for form fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [organisedBy, setOrganisedBy] = useState("");
  const [applicationStartDate, setApplicationStartDate] = useState("");
  const [applicationEndDate, setApplicationEndDate] = useState("");
  const [competitionStartDate, setCompetitionStartDate] = useState("");
  const [competitionEndDate, setCompetitionEndDate] = useState("");
  const [payment, setPayment] = useState("free");
  const [fee, setFee] = useState("");
  
  // State for dynamic field arrays
  const [eligibility, setEligibility] = useState<string[]>([]);
  const [referenceLinks, setReferenceLinks] = useState<string[]>([]);
  const [requirements, setRequirements] = useState<string[]>([]);

  // Form submission handler
  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Format dates to ISO string format
      const formatDate = (dateString: string) => {
        if (!dateString) return null;
        // Create a date object and convert to ISO string
        const date = new Date(dateString);
        return date.toISOString();
      };

      // Log the dates before sending
      console.log("Application Start Date:", applicationStartDate, "Formatted:", formatDate(applicationStartDate));
      console.log("Application End Date:", applicationEndDate, "Formatted:", formatDate(applicationEndDate));
      console.log("Competition Start Date:", competitionStartDate, "Formatted:", formatDate(competitionStartDate));
      console.log("Competition End Date:", competitionEndDate, "Formatted:", formatDate(competitionEndDate));

      const competitionData = {
        name,
        description,
        organised_by: organisedBy,
        application_start_date: formatDate(applicationStartDate),
        application_end_date: formatDate(applicationEndDate),
        competition_start_date: formatDate(competitionStartDate),
        competition_end_date: formatDate(competitionEndDate),
        eligibility,
        reference_links: referenceLinks,
        requirements,
        payment,
        fee: payment === "paid" ? fee : null
      };
      
      const response = await fetch("/api/competitions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(competitionData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit the form");
      }
      
      setSuccess(true);
      setTimeout(() => {
        router.push("/protected/competition/report");
      }, 2000);
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
    <div className="container mx-auto py-8">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-200">
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Competition</h1>
          <p className="text-gray-600 mt-2">Fill out the form below to add a new competition.</p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-md mb-6">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 text-green-500 p-4 rounded-md mb-6">
            Competition created successfully! Redirecting...
          </div>
        )}
        
        <form onSubmit={onSubmit} className="space-y-8">
          <FormSection title="Basic Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5">
              <div className="w-full md:col-span-2">
                <Input
                  id="competition-name"
                  name="name"
                  label="Competition Name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div className="w-full md:col-span-2">
                <Input
                  id="competition-organised-by"
                  name="organisedBy"
                  label="Organised By"
                  required
                  value={organisedBy}
                  onChange={(e) => setOrganisedBy(e.target.value)}
                  className="focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div className="w-full md:col-span-2">
                <label className="block text-sm font-medium text-gray-800 mb-1.5">
                  Description <span className="text-red-600">*</span>
                </label>
                <textarea
                  id="competition-description"
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={4}
                  className="flex w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-sm"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1.5">
                  Application Start Date <span className="text-red-600">*</span>
                </label>
                <input
                  type="date"
                  id="application-start-date"
                  name="applicationStartDate"
                  value={applicationStartDate}
                  onChange={(e) => setApplicationStartDate(e.target.value)}
                  required
                  className="flex w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1.5">
                  Application End Date <span className="text-red-600">*</span>
                </label>
                <input
                  type="date"
                  id="application-end-date"
                  name="applicationEndDate"
                  value={applicationEndDate}
                  onChange={(e) => setApplicationEndDate(e.target.value)}
                  required
                  className="flex w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1.5">
                  Competition Start Date <span className="text-red-600">*</span>
                </label>
                <input
                  type="date"
                  id="competition-start-date"
                  name="competitionStartDate"
                  value={competitionStartDate}
                  onChange={(e) => setCompetitionStartDate(e.target.value)}
                  required
                  className="flex w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1.5">
                  Competition End Date <span className="text-red-600">*</span>
                </label>
                <input
                  type="date"
                  id="competition-end-date"
                  name="competitionEndDate"
                  value={competitionEndDate}
                  onChange={(e) => setCompetitionEndDate(e.target.value)}
                  required
                  className="flex w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-800 mb-1.5">
                  Payment Type <span className="text-red-600">*</span>
                </label>
                <select
                  id="payment-type"
                  name="payment"
                  value={payment}
                  onChange={(e) => setPayment(e.target.value)}
                  required
                  className="flex w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-sm"
                >
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              
              {payment === "paid" && (
                <div>
                  <Input
                    id="competition-fee"
                    name="fee"
                    label="Fee (with currency)"
                    required
                    value={fee}
                    onChange={(e) => setFee(e.target.value)}
                    placeholder="e.g., $50 or ₹1000"
                    className="focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          </FormSection>
          
          <FormSection title="Competition Details">
            <DynamicFieldArray
              values={eligibility}
              onChange={(index, value) => {
                const newEligibility = [...eligibility];
                newEligibility[index] = value;
                setEligibility(newEligibility);
              }}
              onAdd={() => setEligibility([...eligibility, ""])}
              onRemove={(index) => {
                const newEligibility = [...eligibility];
                newEligibility.splice(index, 1);
                setEligibility(newEligibility);
              }}
              legend="Eligibility Criteria"
              fieldLabel="Eligibility"
              name="eligibility"
              required
            />
            
            <DynamicFieldArray
              values={referenceLinks}
              onChange={(index, value) => {
                const newReferenceLinks = [...referenceLinks];
                newReferenceLinks[index] = value;
                setReferenceLinks(newReferenceLinks);
              }}
              onAdd={() => setReferenceLinks([...referenceLinks, ""])}
              onRemove={(index) => {
                const newReferenceLinks = [...referenceLinks];
                newReferenceLinks.splice(index, 1);
                setReferenceLinks(newReferenceLinks);
              }}
              legend="Reference Links"
              fieldLabel="Link"
              name="referenceLinks"
            />
            
            <DynamicFieldArray
              values={requirements}
              onChange={(index, value) => {
                const newRequirements = [...requirements];
                newRequirements[index] = value;
                setRequirements(newRequirements);
              }}
              onAdd={() => setRequirements([...requirements, ""])}
              onRemove={(index) => {
                const newRequirements = [...requirements];
                newRequirements.splice(index, 1);
                setRequirements(newRequirements);
              }}
              legend="Requirements"
              fieldLabel="Requirement"
              name="requirements"
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