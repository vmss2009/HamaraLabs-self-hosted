"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import FormSection from "@/components/forms/FormSection";
import TextFieldGroup from "@/components/forms/TextFieldGroup";
import SelectField from "@/components/forms/SelectField";
import RadioButtonGroup from "@/components/forms/RadioButtonGroup";
import DynamicFieldArray from "@/components/forms/DynamicFieldArray";
import { Input } from "@/components/ui/Input";

// Define types for the form data
type Subject = {
  id: number;
  subject_name: string;
};

type Topic = {
  id: number;
  topic_name: string;
};

type Subtopic = {
  id: number;
  subtopic_name: string;
};

export default function TinkeringActivityForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for form fields
  const [name, setName] = useState("");
  const [introduction, setIntroduction] = useState("");
  
  // State for cascading dropdowns
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [subtopics, setSubtopics] = useState<Subtopic[]>([]);
  
  // Selected values
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedSubtopic, setSelectedSubtopic] = useState("");
  
  // State for dynamic field arrays
  const [goals, setGoals] = useState<string[]>([]);
  const [materials, setMaterials] = useState<string[]>([]);
  const [instructions, setInstructions] = useState<string[]>([]);
  const [tips, setTips] = useState<string[]>([]);
  const [observations, setObservations] = useState<string[]>([]);
  const [extensions, setExtensions] = useState<string[]>([]);
  const [resources, setResources] = useState<string[]>([]);
  
  // Fetch subjects on component mount
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
  
  // Fetch topics when subject changes
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
        const response = await fetch(`/api/topics?subjectId=${selectedSubject}`);
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
  
  // Fetch subtopics when topic changes
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
  
  // Form submission handler
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
        resources
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
    <div className="container mx-auto py-8">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-200">
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Tinkering Activity</h1>
          <p className="text-gray-600 mt-2">Fill out the form below to add a new tinkering activity.</p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-md mb-6">
            {error}
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
              <SelectField
                name="subject"
                label="Subject"
                options={[
                  ...subjects.map(subject => ({
                    value: subject.id.toString(),
                    label: subject.subject_name
                  }))
                ]}
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                required
              />
              
              <SelectField
                name="topic"
                label="Topic"
                options={[
                  ...topics.map(topic => ({
                    value: topic.id.toString(),
                    label: topic.topic_name
                  }))
                ]}
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                required
                className={!selectedSubject ? "opacity-50 pointer-events-none" : ""}
              />
              
              <SelectField
                name="subtopic"
                label="Subtopic"
                options={[
                  ...subtopics.map(subtopic => ({
                    value: subtopic.id.toString(),
                    label: subtopic.subtopic_name
                  }))
                ]}
                value={selectedSubtopic}
                onChange={(e) => setSelectedSubtopic(e.target.value)}
                required
                className={!selectedTopic ? "opacity-50 pointer-events-none" : ""}
              />
            </div>
          </FormSection>
          
          <FormSection title="Activity Details">
            <DynamicFieldArray
              values={goals}
              onChange={(index, value) => {
                const newGoals = [...goals];
                newGoals[index] = value;
                setGoals(newGoals);
              }}
              onAdd={() => setGoals([...goals, ""])}
              onRemove={(index) => {
                const newGoals = [...goals];
                newGoals.splice(index, 1);
                setGoals(newGoals);
              }}
              legend="Goals"
              fieldLabel="Goal"
              name="goals"
              required
            />
            
            <DynamicFieldArray
              values={materials}
              onChange={(index, value) => {
                const newMaterials = [...materials];
                newMaterials[index] = value;
                setMaterials(newMaterials);
              }}
              onAdd={() => setMaterials([...materials, ""])}
              onRemove={(index) => {
                const newMaterials = [...materials];
                newMaterials.splice(index, 1);
                setMaterials(newMaterials);
              }}
              legend="Materials"
              fieldLabel="Material"
              name="materials"
              required
            />
            
            <DynamicFieldArray
              values={instructions}
              onChange={(index, value) => {
                const newInstructions = [...instructions];
                newInstructions[index] = value;
                setInstructions(newInstructions);
              }}
              onAdd={() => setInstructions([...instructions, ""])}
              onRemove={(index) => {
                const newInstructions = [...instructions];
                newInstructions.splice(index, 1);
                setInstructions(newInstructions);
              }}
              legend="Instructions"
              fieldLabel="Instruction"
              name="instructions"
              required
            />
            
            <DynamicFieldArray
              values={tips}
              onChange={(index, value) => {
                const newTips = [...tips];
                newTips[index] = value;
                setTips(newTips);
              }}
              onAdd={() => setTips([...tips, ""])}
              onRemove={(index) => {
                const newTips = [...tips];
                newTips.splice(index, 1);
                setTips(newTips);
              }}
              legend="Tips"
              fieldLabel="Tip"
              name="tips"
            />
            
            <DynamicFieldArray
              values={observations}
              onChange={(index, value) => {
                const newObservations = [...observations];
                newObservations[index] = value;
                setObservations(newObservations);
              }}
              onAdd={() => setObservations([...observations, ""])}
              onRemove={(index) => {
                const newObservations = [...observations];
                newObservations.splice(index, 1);
                setObservations(newObservations);
              }}
              legend="Observations"
              fieldLabel="Observation"
              name="observations"
            />
            
            <DynamicFieldArray
              values={extensions}
              onChange={(index, value) => {
                const newExtensions = [...extensions];
                newExtensions[index] = value;
                setExtensions(newExtensions);
              }}
              onAdd={() => setExtensions([...extensions, ""])}
              onRemove={(index) => {
                const newExtensions = [...extensions];
                newExtensions.splice(index, 1);
                setExtensions(newExtensions);
              }}
              legend="Extensions"
              fieldLabel="Extension"
              name="extensions"
            />
            
            <DynamicFieldArray
              values={resources}
              onChange={(index, value) => {
                const newResources = [...resources];
                newResources[index] = value;
                setResources(newResources);
              }}
              onAdd={() => setResources([...resources, ""])}
              onRemove={(index) => {
                const newResources = [...resources];
                newResources.splice(index, 1);
                setResources(newResources);
              }}
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
            >
              Submit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 