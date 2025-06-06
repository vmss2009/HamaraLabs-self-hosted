"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import { Button } from "@/components/Button";
import FormSection from "@/components/FormSection";
import { useRouter } from "next/navigation";
import { Input } from "@/components/Input";
import DateFieldGroup from "@/components/DateField";
import MultiForm from "@/components/forms/DynamicFieldArray";

export default function EditCompetitionForm({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [organisedBy, setOrganisedBy] = useState("");
  const [applicationStartDate, setApplicationStartDate] = useState("");
  const [applicationEndDate, setApplicationEndDate] = useState("");
  const [competitionStartDate, setCompetitionStartDate] = useState("");
  const [competitionEndDate, setCompetitionEndDate] = useState("");
  const [payment, setPayment] = useState("free");
  const [fee, setFee] = useState("");

  const [eligibility, setEligibility] = useState<string[]>([]);
  const [referenceLinks, setReferenceLinks] = useState<string[]>([]);
  const [requirements, setRequirements] = useState<string[]>([]);

  useEffect(() => {
    const fetchCompetition = async () => {
      try {
        const response = await fetch(`/api/competitions/${resolvedParams.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch competition");
        }
        const data = await response.json();

        setName(data.name || "");
        setDescription(data.description || "");
        setOrganisedBy(data.organised_by || "");

        const formatDateForInput = (dateString: string | null) => {
          if (!dateString) return "";
          const date = new Date(dateString);
          return date.toISOString().split("T")[0];
        };

        setApplicationStartDate(
          formatDateForInput(data.application_start_date)
        );
        setApplicationEndDate(formatDateForInput(data.application_end_date));
        setCompetitionStartDate(
          formatDateForInput(data.competition_start_date)
        );
        setCompetitionEndDate(formatDateForInput(data.competition_end_date));

        setPayment(data.payment || "free");
        setFee(data.fee || "");

        setEligibility(data.eligibility || []);
        setReferenceLinks(data.reference_links || []);
        setRequirements(data.requirements || []);
      } catch (error) {
        setError("Error loading competition data. Please try again.");
        console.error(error);
      }
    };

    fetchCompetition();
  }, [resolvedParams.id]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const formatDate = (dateString: string) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toISOString();
      };

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
        fee: payment === "paid" ? fee : null,
      };

      const response = await fetch(`/api/competitions/${resolvedParams.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(competitionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update the competition");
      }

      router.push("/protected/competition/report");
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
            Edit competition
          </h1>
          <p className="text-gray-600 mt-2">
            Update the details of competition below
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
                <label className="block text-sm font-bold text-gray-800 mb-1.5">
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
                <DateFieldGroup
                  name="applicationStartDate"
                  value={applicationStartDate}
                  onChange={(e) => setApplicationStartDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <DateFieldGroup
                  name="applicationEndDate"
                  value={applicationEndDate}
                  onChange={(e) => setApplicationEndDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <DateFieldGroup
                  name="competitionStartDate"
                  value={competitionStartDate}
                  onChange={(e) => setCompetitionStartDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <DateFieldGroup
                  name="competitionEndDate"
                  value={competitionEndDate}
                  onChange={(e) => setCompetitionEndDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-1.5">
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
            <MultiForm
              className="mb-5"
              placeholder="Eligibility"
              values={eligibility}
              setArray={setEligibility}
              legend="Eligibility Criteria"
              fieldLabel="Eligibility"
              name="eligibility"
              required
            />

            <MultiForm
              className="mb-5"
              placeholder="Reference Link"
              values={referenceLinks}
              setArray={setReferenceLinks}
              legend="Reference Links"
              fieldLabel="Link"
              name="referenceLinks"
            />

            <MultiForm
              className="mb-5"
              placeholder="Requirement"
              values={requirements}
              setArray={setRequirements}
              legend="Requirements"
              fieldLabel="Requirement"
              name="requirements"
              required
            />
          </FormSection>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              onClick={() => router.push("/protected/competition/report")}
              variant="outline"
              size="lg"
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading} size="lg">
              Update
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
