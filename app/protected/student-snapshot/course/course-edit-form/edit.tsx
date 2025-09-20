"use client";

import React, { useRef, useState } from "react";
import Modal from "@/components/form/Modal";
import { Button } from "@/components/ui/Button";
import { SelectedAttachmentPreview } from "@/components/chat/AttachmentPreview";

export interface EditCourseDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    uploadedMeta: Array<{ url: string; filename?: string; type?: string; size?: number }>,
    comments: string,
    attachments: string[]
  ) => void | Promise<void>;
  initialComments: string;
  initialAttachments: string[];
  initialAttachmentMetas?: Array<{ url: string; filename?: string | null }>;
  courseId: string | number | null;
}

export const EditCourseDialog: React.FC<EditCourseDialogProps> = ({
  open,
  onClose,
  onSubmit,
  initialComments,
  initialAttachments,
  initialAttachmentMetas,
  courseId,
}) => {
  const [comments, setComments] = useState<string>(initialComments || "");
  const [attachments, setAttachments] = useState<string[]>(Array.isArray(initialAttachments) ? initialAttachments : []);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    setComments(initialComments || "");
  }, [initialComments]);

  React.useEffect(() => {
    setAttachments(Array.isArray(initialAttachments) ? initialAttachments : []);
  }, [initialAttachments]);

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

  const nameByUrl = React.useMemo(() => {
    const m = new Map<string, string>();
    (initialAttachmentMetas || []).forEach((a) => {
      if (a?.url) m.set(a.url, a.filename || a.url.split('/').pop() || a.url);
    });
    return m;
  }, [initialAttachmentMetas]);

  function displayName(url: string) {
    return nameByUrl.get(url) || url.split('/').pop() || url;
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Course"
      size="xl"
      footer={
        <>
          <Button onClick={onClose} variant="outline">Cancel</Button>
          <Button onClick={async () => {
            try {
              setUploading(true);
              const metas: { url: string; filename?: string; type?: string; size?: number }[] = [];
              if (courseId && pendingFiles.length > 0) {
                const uploads = Array.from(pendingFiles).map(async (f) => {
                  const fd = new FormData();
                  fd.append('courseId', String(courseId));
                  fd.append('file', f);
                  const res = await fetch('/api/storage/upload-customised-course', { method: 'POST', body: fd });
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
              const newUrls = metas.map(m => m.url);
              const merged = [...attachments, ...newUrls];
              await onSubmit(metas as any, comments, merged);
            } finally {
              setUploading(false);
            }
          }} variant="default">{uploading ? 'Saving…' : 'Save Changes'}</Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Comments */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-lg font-semibold text-gray-900 mb-2">Comments</div>
          <input
            name="comments"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="flex w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-sm"
          />
        </div>

        {/* Attachments */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-lg font-semibold text-gray-900 mb-2">Attachments</div>

          {/* Existing attachments */}
          <div className="flex flex-wrap gap-2 mb-3">
            {Array.isArray(attachments) && attachments.length > 0 ? (
              attachments.map((url, index) => (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 max-w-full px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm hover:bg-blue-200"
                >
                  <span className="truncate" title={displayName(url)}>{displayName(url)}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setAttachments(attachments.filter((_, i) => i !== index));
                    }}
                    className="ml-1 text-blue-700 hover:text-blue-900"
                    aria-label="Remove"
                  >
                    ×
                  </button>
                </a>
              ))
            ) : (
              <div className="text-sm text-gray-600">No files attached.</div>
            )}
          </div>

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