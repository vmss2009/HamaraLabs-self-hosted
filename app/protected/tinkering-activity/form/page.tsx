"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import FormSection from "@/components/forms/FormSection";
import SelectField from "@/components/forms/SelectField";
import MultiForm from "@/components/forms/Multiform";
import { Input } from "@/components/ui/Input";
import { Subject, Topic, Subtopic } from "@/lib/db/tinkering-activity/type";

export default function TinkeringActivityForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [introduction, setIntroduction] = useState("");

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);

  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedSubtopic, setSelectedSubtopic] = useState("");

  const [goals, setGoals] = useState<string[]>([]);
  const [materials, setMaterials] = useState<string[]>([]);
  const [instructions, setInstructions] = useState<string[]>([]);
  const [tips, setTips] = useState<string[]>([]);
  const [observations, setObservations] = useState<string[]>([]);
  const [extensions, setExtensions] = useState<string[]>([]);
  const [resources, setResources] = useState<string[]>([]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch("/api/subjects");
        if (!response.ok) {
          throw new Error("Failed to fetch subjects");
        }
        const data = await response.json();
        setSubjects(data);
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };

    fetchSubjects();
  }, []);

  useEffect(() => {
    const fetchTopics = async () => {
      if (!selectedSubject) {
        setTopics([]);
        setSelectedTopic("");
        setSubtopics([]);
        setSelectedSubtopic("");
        return;
      }

      try {
        const response = await fetch(
          `/api/topics?subjectId=${selectedSubject}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch topics");
        }
        const data = await response.json();
        setTopics(data);
      } catch (error) {
        console.error("Error fetching topics:", error);
      }
    };

    fetchTopics();
  }, [selectedSubject]);

  useEffect(() => {
    const fetchSubtopics = async () => {
      if (!selectedTopic) {
        setSubtopics([]);
        setSelectedSubtopic("");
        return;
      }

      try {
        const response = await fetch(`/api/subtopics?topicId=${selectedTopic}`);
        if (!response.ok) {
          throw new Error("Failed to fetch subtopics");
        }
        const data = await response.json();
        setSubtopics(data);
      } catch (error) {
        console.error("Error fetching subtopics:", error);
      }
    };

    fetchSubtopics();
  }, [selectedTopic]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const tinkeringActivityData = {
        name,
        subtopicId: parseInt(selectedSubtopic),
        introduction,
        goals,
        materials,
        instructions,
        tips,
        observations,
        extensions,
        resources,
      };

      const response = await fetch("/api/tinkering-activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tinkeringActivityData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit the form");
      }

      router.push("/protected/tinkering-activity/report");
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
            Tinkering Activity
          </h1>
          <p className="text-gray-600 mt-2">
            Fill out the form below to add a new tinkering activity.
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
                  name="name"
                  label="Activity Name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="focus:border-blue-500  focus:ring-blue-500"
                />
              </div>
              <div className="w-full md:col-span-2">
                <label className="block text-sm font-bold text-gray-800 mb-1.5">
                  Introduction <span className="text-red-600">*</span>
                </label>
                <textarea
                  name="introduction"
                  value={introduction}
                  onChange={(e) => setIntroduction(e.target.value)}
                  required
                  rows={4}
                  className="flex w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <SelectField
                name="subject"
                label="Subject"
                options={[
                  ...subjects.map((subject) => ({
                    value: subject.id.toString(),
                    label: subject.subject_name,
                  })),
                ]}
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                required
              />

              <SelectField
                name="topic"
                label="Topic"
                options={[
                  ...topics.map((topic) => ({
                    value: topic.id.toString(),
                    label: topic.topic_name,
                  })),
                ]}
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                required
                className={
                  !selectedSubject ? "opacity-50 pointer-events-none" : ""
                }
              />

              <SelectField
                name="subtopic"
                label="Subtopic"
                options={[
                  ...subtopics.map((subtopic) => ({
                    value: subtopic.id.toString(),
                    label: subtopic.subtopic_name,
                  })),
                ]}
                value={selectedSubtopic}
                onChange={(e) => setSelectedSubtopic(e.target.value)}
                required
                className={
                  !selectedTopic ? "opacity-50 pointer-events-none" : ""
                }
              />
            </div>
          </FormSection>

          <FormSection title="Activity Details" className="">
            <MultiForm
              className="mb-5"
              placeholder="Goal"
              setArray={setGoals}
              values={goals}
              legend="Goals"
              fieldLabel="Goal"
              name="goals"
            />

            <MultiForm
              placeholder="Material"
              className="mb-5"
              values={materials}
              setArray={setMaterials}
              legend="Materials"
              fieldLabel="Material"
              name="materials"
            />

            <MultiForm
              placeholder="Instruction"
              className="mb-5"
              values={instructions}
              setArray={setInstructions}
              legend="Instructions"
              fieldLabel="Instruction"
              name="instructions"
            />

            <MultiForm
              className="mb-5"
              placeholder="Tip"
              values={tips}
              setArray={setTips}
              legend="Tips"
              fieldLabel="Tip"
              name="tips"
            />

            <MultiForm
              className="mb-5"
              placeholder="Observation"
              values={observations}
              setArray={setObservations}
              legend="Observations"
              fieldLabel="Observation"
              name="observations"
            />

            <MultiForm
              className="mb-5"
              placeholder="Extension"
              values={extensions}
              setArray={setExtensions}
              legend="Extensions"
              fieldLabel="Extension"
              name="extensions"
            />

            <MultiForm
              className="mb-5"
              placeholder="Resourse"
              values={resources}
              setArray={setResources}
              legend="Resources"
              fieldLabel="Resource"
              name="resources"
            />
          </FormSection>

          <div className="flex justify-end space-x-4">
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
