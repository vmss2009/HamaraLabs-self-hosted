"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import { Button } from "@/components/ui/Button";
import FormSection from "@/components/form/FormSection";
import SelectField from "@/components/form/SelectField";
import SearchableSelect from "@/components/form/SearchableSelect";
import MultiForm from "@/components/form/Multiform";
import { useRouter } from "next/navigation";
import { Input } from "@/components/form/Input";
import { Subject, Topic, Subtopic } from "@/lib/db/tinkering-activity/type";

export default function EditTinkeringActivityForm({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
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
  const [pendingFiles, setPendingFiles] = useState<Record<number, { file: File; id: string; display: string }>>({});
  const PENDING_PREFIX = '__PENDING_FILE__:';

  function setResourcesWithCleanup(newArr: string[]) {
    setResources(newArr);
    setPendingFiles((prev) => {
      const next: typeof prev = {};
      newArr.forEach((val, idx) => {
        if (val.startsWith(PENDING_PREFIX) && prev[idx]) next[idx] = prev[idx];
      });
      return next;
    });
  }

  useEffect(() => {
    const fetchTinkeringActivity = async () => {
      try {
        const response = await fetch(
          `/api/tinkering-activities/${resolvedParams.id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch tinkering activity");
        }
        const data = await response.json();

        setName(data.name || "");
        setIntroduction(data.introduction || "");

        setGoals(data.goals || []);
        setMaterials(data.materials || []);
        setInstructions(data.instructions || []);
        setTips(data.tips || []);
        setObservations(data.observations || []);
    setExtensions(data.extensions || []);
    setResources(Array.isArray(data.resources) ? data.resources : []);

        if (data.subtopic) {
          setSelectedSubtopic(data.subtopic.id.toString());

          if (data.subtopic.topic) {
            setSelectedTopic(data.subtopic.topic.id.toString());

            const subtopicsResponse = await fetch(
              `/api/subtopics?topicId=${data.subtopic.topic.id}`
            );
            const subtopicsData = await subtopicsResponse.json();
            setSubtopics(subtopicsData);

            if (data.subtopic.topic.subject) {
              setSelectedSubject(data.subtopic.topic.subject.id.toString());

              const topicsResponse = await fetch(
                `/api/topics?subjectId=${data.subtopic.topic.subject.id}`
              );
              const topicsData = await topicsResponse.json();
              setTopics(topicsData);
            }
          }
        }
      } catch (error) {
        setError("Error loading tinkering activity data. Please try again.");
        console.error(error);
      }
    };

    fetchTinkeringActivity();
  }, [resolvedParams.id]);

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
        if (!selectedTopic) {
          setSelectedTopic("");
          setSubtopics([]);
          setSelectedSubtopic("");
        }
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
        if (
          !data.some((topic: Topic) => topic.id.toString() === selectedTopic)
        ) {
          setSelectedTopic("");
          setSubtopics([]);
          setSelectedSubtopic("");
        }
      } catch (error) {
        console.error("Error fetching topics:", error);
      }
    };

    fetchTopics();
  }, [selectedSubject, selectedTopic]);

  useEffect(() => {
    const fetchSubtopics = async () => {
      if (!selectedTopic) {
        setSubtopics([]);
        if (!selectedSubtopic) {
          setSelectedSubtopic("");
        }
        return;
      }

      try {
        const response = await fetch(`/api/subtopics?topicId=${selectedTopic}`);
        if (!response.ok) {
          throw new Error("Failed to fetch subtopics");
        }
        const data = await response.json();
        setSubtopics(data);
        if (
          !data.some(
            (subtopic: Subtopic) => subtopic.id.toString() === selectedSubtopic
          )
        ) {
          setSelectedSubtopic("");
        }
      } catch (error) {
        console.error("Error fetching subtopics:", error);
      }
    };

    fetchSubtopics();
  }, [selectedTopic, selectedSubtopic]);

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
        // Resolve pending files first
        resources: (await (async () => {
          let finalResources = [...resources];
          const entries = Object.entries(pendingFiles);
          for (const [idxStr, meta] of entries) {
            const idx = parseInt(idxStr, 10);
            if (!finalResources[idx] || !finalResources[idx].startsWith(PENDING_PREFIX)) continue;
            const fd = new FormData();
            fd.append('file', meta.file);
            fd.append('taId', resolvedParams.id);
            const res = await fetch('/api/storage/upload-ta-resource', { method: 'POST', body: fd });
            const data = await res.json().catch(()=>({}));
            if(!res.ok || !data?.url) throw new Error(`Failed to upload resource file: ${meta.display}`);
            finalResources[idx] = String(data.url);
          }
          return finalResources.filter(Boolean);
        })()),
      };

      const response = await fetch(
        `/api/tinkering-activities/${resolvedParams.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(tinkeringActivityData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to update the tinkering activity"
        );
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
            Edit Tinkering Activity
          </h1>
          <p className="text-gray-600 mt-2">
            Update the details of this tinkering activity.
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
                  className="focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="w-full md:col-span-2">
                <label className="block text-sm font-medium text-gray-800 mb-1.5">
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
              <SearchableSelect<string>
                label="Subject"
                options={subjects.map((s) => ({ value: s.id.toString(), label: s.subject_name }))}
                value={selectedSubject || null}
                onChange={(v) => setSelectedSubject((Array.isArray(v) ? v[0] : v) ?? "")}
              />

              <SearchableSelect<string>
                label="Topic"
                options={topics.map((t) => ({ value: t.id.toString(), label: t.topic_name }))}
                value={selectedTopic || null}
                onChange={(v) => setSelectedTopic((Array.isArray(v) ? v[0] : v) ?? "")}
                className={!selectedSubject ? "opacity-50 pointer-events-none" : ""}
              />

              <SearchableSelect<string>
                label="Subtopic"
                options={subtopics.map((st) => ({ value: st.id.toString(), label: st.subtopic_name }))}
                value={selectedSubtopic || null}
                onChange={(v) => setSelectedSubtopic((Array.isArray(v) ? v[0] : v) ?? "")}
                className={!selectedTopic ? "opacity-50 pointer-events-none" : ""}
              />
            </div>
          </FormSection>

          <FormSection title="Activity Details">
            <MultiForm
              values={goals}
              className="mb-5"
              placeholder="Goal"
              setArray={setGoals}
              legend="Goals"
              fieldLabel="Goal"
              name="goals"
            />

            <MultiForm
              className="mb-5"
              values={materials}
              placeholder="Material"
              setArray={setMaterials}
              legend="Materials"
              fieldLabel="Material"
              name="materials"
            />

            <MultiForm
              className="mb-5"
              values={instructions}
              placeholder="Instruction"
              setArray={setInstructions}
              legend="Instructions"
              fieldLabel="Instruction"
              name="instructions"
            />

            <MultiForm
              className="mb-5"
              values={tips}
              placeholder="Tip"
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
              values={extensions}
              className="mb-5"
              placeholder="Extension"
              setArray={setExtensions}
              legend="Extensions"
              fieldLabel="Extension"
              name="extensions"
            />

            <MultiForm
              className="mb-5"
              placeholder="Resource"
              values={resources}
              setArray={setResourcesWithCleanup}
              legend="Resources"
              fieldLabel="Resource"
              name="resources"
              onUpload={async (idx, file) => {
                const id = Math.random().toString(36).slice(2);
                setPendingFiles((prev) => ({ ...prev, [idx]: { file, id, display: file.name } }));
                return { value: `${PENDING_PREFIX}${id}`, display: file.name, readOnly: true };
              }}
              uploadButtonLabel="Upload"
              initializeMeta={(value) => {
                if (!value || typeof value !== 'string') return null;
                if (value.startsWith(PENDING_PREFIX)) return null; // pending placeholders handled separately
                // Match any host but require the path segment pattern containing this activity id.
                const pathNeedle = `/tinkering-activity/base-ta/${resolvedParams.id}/resources/`;
                if (value.includes(pathNeedle)) {
                  const withoutQuery = value.split('?')[0];
                  const last = withoutQuery.split('/').filter(Boolean).pop();
                  return { readOnly: true, display: last || value };
                }
                return null;
              }}
            />
          </FormSection>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              className="px-8 py-3 font-semibold rounded-full shadow-lg hover:from-purple-600 hover:to-indigo-700 transition"
              onClick={() =>
                router.push("/protected/tinkering-activity/report")
              }
              variant="outline"
              size="lg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
              size="lg"
              className="px-8 py-3 font-semibold bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full shadow-lg hover:from-purple-600 hover:to-indigo-700 transition"
            >
              Update
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
