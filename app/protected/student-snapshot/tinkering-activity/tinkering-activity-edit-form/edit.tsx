"use client";

import React from "react";
import Modal from "@/components/form/Modal";
import { Input } from "@/components/form/Input";
import SelectField from "@/components/form/SelectField";
import { Button } from "@/components/form/Button";
import { EditActivityDialogProps } from "@/lib/db/tinkering-activity/type";

export const EditActivityDialog: React.FC<EditActivityDialogProps> = ({
  open,
  onClose,
  onSubmit,
  editFormData,
  handleEditFormChange,
  handleArrayFieldChange,
  handleAddArrayItem,
  handleRemoveArrayItem,
  selectedSubject,
  setSelectedSubject,
  selectedTopic,
  setSelectedTopic,
  selectedSubtopic,
  setSelectedSubtopic,
  subjects,
  topics,
  subtopics,
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Tinkering Activity"
      size="xl"
      footer={
        <>
          <Button onClick={onClose} variant="outline">Cancel</Button>
          <Button onClick={onSubmit} variant="default">Save Changes</Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Activity Name */}
        <div>
          <Input
              name="Activity Name"
              label="Activity Name"
              value={editFormData.name || ""}
              onChange={(e) => handleEditFormChange("name", e.target.value)}
              className="focus:border-blue-500 focus:ring-blue-500"
            />
        </div>
        {/* Subject, Topic, Subtopic */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <SelectField
                    name="subject"
                    label="Subject"
                    options={subjects.map((subject) => ({
                      value: subject.id.toString(),
                      label: subject.subject_name,
                    }))}
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                  />
            </div>

            <div>
              <SelectField
                    name="Topic"
                    label="Topic"
                    options={topics.map((topic) => ({
                      value: topic.id.toString(),
                      label: topic.topic_name,
                    }))}
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                  />
            </div>

            <div>
              <SelectField
                    name="Subtopic"
                    label="Subtopic"
                    options={subtopics.map((subtopic) => ({
                      value: subtopic.id.toString(),
                      label: subtopic.subtopic_name,
                    }))}
                    value={selectedSubtopic}
                    onChange={(e) => setSelectedSubtopic(e.target.value)}
                  />
            </div>
          </div>
        </div>

        {/* Introduction */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-lg font-semibold text-gray-900 mb-2">Introduction</div>
          <textarea
                name="introduction"
                value={editFormData.introduction || ""}
                onChange={(e) =>
                  handleEditFormChange("introduction", e.target.value)
                }
                required
                rows={4}
                className="flex w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-sm"
              />
        </div>

        {/* Dynamic Array Fields */}
        {[
          "goals",
            "materials",
            "instructions",
            "tips",
            "observations",
            "extensions",
            "resources",
        ].map((field) => (
          <div key={field} className="bg-gray-50 p-4 rounded-lg">
            <div className="text-lg font-semibold text-gray-900 mb-2">
              {field.charAt(0).toUpperCase() + field.slice(1)}
            </div>

            {(() => {
              let arrayValue = (editFormData as any)[field];
              if (!Array.isArray(arrayValue)) {
                arrayValue = arrayValue ? [arrayValue] : [""];
              }

              return arrayValue.map((item: string, index: number) => (
                <div key={index} className="flex items-center mb-2">
                  <Input
                        name={`${field}-${index}`}
                        value={item}
                        onChange={(e) =>
                          handleArrayFieldChange(field as any, index, e.target.value)
                        }
                        className="focus:border-blue-500 focus:ring-blue-500"
                      />

                      <button
                        type="button"
                        onClick={() => handleRemoveArrayItem(field as any, index)}
                        className="ml-2 text-red-600 hover:text-red-700 p-1"
                        aria-label="Remove"
                      >
                        −
                      </button>
                    </div>
                  ));
                })()}

            <div className="flex items-center mt-1">
              <button
                type="button"
                onClick={() => handleAddArrayItem(field as any)}
                className="text-green-600 hover:text-green-700 p-1"
                aria-label="Add"
              >
                +
              </button>
              <span className="ml-2 text-sm text-gray-700">
                Add {field.charAt(0).toUpperCase() + field.slice(1).replace(/s$/, "")}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
};
