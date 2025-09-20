"use client";

import React, { useRef, useState } from "react";
import Modal from "@/components/form/Modal";
import { Input } from "@/components/form/Input";
import SelectField from "@/components/form/SelectField";
import { Button } from "@/components/ui/Button";
import { SelectedAttachmentPreview } from "@/components/chat/AttachmentPreview";
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
  activityId,
}) => {
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function addPending(files: FileList | File[]) {
    setPendingFiles((prev) => {
      const existing = new Map(prev.map(f => [f.name + ':' + f.size + ':' + f.lastModified, true]));
      const next = [...prev];
      for (const f of Array.from(files)) {
        const k = f.name + ':' + f.size + ':' + f.lastModified;
        if (existing.has(k)) continue;
        next.push(f);
        existing.set(k, true);
      }
      return next;
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Tinkering Activity"
      size="xl"
      footer={
        <>
          <Button onClick={onClose} variant="outline">Cancel</Button>
          <Button onClick={async () => {
            // Upload pending files (if any), then submit with uploaded metadata
            try {
              setUploading(true);
              const metas: { url: string; filename?: string; type?: string; size?: number }[] = [];
              if (activityId && pendingFiles.length > 0) {
                const uploads = Array.from(pendingFiles).map(async (f) => {
                  const fd = new FormData();
                  fd.append('taId', activityId);
                  fd.append('file', f);
                  const res = await fetch('/api/storage/upload-customised-ta', { method: 'POST', body: fd });
                  const data = await res.json().catch(() => ({}));
                  if (res.ok && data?.url) {
                    metas.push({ url: String(data.url), filename: String(data.filename || f.name), type: String(data.type || f.type || ''), size: Number(data.size || f.size || 0) });
                  } else {
                    console.error('Upload failed', data?.error || res.statusText);
                  }
                });
                await Promise.all(uploads);
              }
              setPendingFiles([]);
              onSubmit(metas as any);
            } finally {
              setUploading(false);
            }
          }} variant="default">{uploading ? 'Saving…' : 'Save Changes'}</Button>
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

        {/* Comments (Customised TA only) */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-lg font-semibold text-gray-900 mb-2">Comments</div>
          <input
            name="comments"
            value={(editFormData as any).comments || ""}
            onChange={(e) => handleEditFormChange("comments" as any, e.target.value)}
            className="flex w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-sm"
          />
        </div>

        {/* Attachments (Customised TA) */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-lg font-semibold text-gray-900 mb-2">Attachments</div>
          <div className="flex items-center gap-3 mb-3">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={(e) => {
                if (e.currentTarget.files) addPending(e.currentTarget.files);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="hidden"
            />
            <button
              type="button"
              className="px-3 py-2 rounded-md border text-sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Select files
            </button>
          </div>

          {/* Existing attachments */}
          <div className="space-y-2">
            {Array.isArray((editFormData as any).attachments) && (editFormData as any).attachments.length > 0 ? (
              (editFormData as any).attachments.map((url: string, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white border rounded">
                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 break-all text-sm">
                    {url}
                  </a>
                  <button
                    type="button"
                    className="ml-3 text-red-600 text-sm"
                    onClick={() => handleRemoveArrayItem('attachments' as any, index)}
                  >
                    Remove
                  </button>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-600">No files attached.</div>
            )}
          </div>

          {/* Pending files (to be uploaded on Save) */}
          <div className="mt-3 space-y-2">
            {pendingFiles.length > 0 && (
              <div className="text-sm text-gray-700 font-medium">Pending uploads:</div>
            )}
            {pendingFiles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {pendingFiles.map((f, i) => (
                  <SelectedAttachmentPreview key={i} file={f} onRemove={() => setPendingFiles(pendingFiles.filter((_, idx) => idx !== i))} />
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </Modal>
  );
};
