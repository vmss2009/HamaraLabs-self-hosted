"use client";

import React, { useState } from "react";

interface MultiFormProps {
  values?: string[];
  legend?: string;
  setArray: (newArray: string[]) => void;
  className?: string;
  label?: string;
  fieldLabel?: string;
  name?: string;
  placeholder?: string;
  required?: boolean;
  // Optional upload handler: if provided, an Upload button appears for each row.
  onUpload?: (index: number, file: File) => Promise<string | { value: string; display?: string; readOnly?: boolean }> | string | { value: string; display?: string; readOnly?: boolean };
  uploadButtonLabel?: string; // default: 'Upload'
  initializeMeta?: (value: string, index: number) => { readOnly?: boolean; display?: string } | null | undefined;
}

const MultiForm: React.FC<MultiFormProps> = ({
  values = [],
  legend,
  setArray,
  className = "",
  label,
  fieldLabel,
  name,
  placeholder = "",
  required = false,
  onUpload,
  uploadButtonLabel = 'Upload',
  initializeMeta,
}) => {
  const [internalValues, setInternalValues] = useState<string[]>(
    values.length > 0 ? values : [""]
  );

  const fileInputs = React.useRef<Record<number, HTMLInputElement | null>>({});
  const [rowMeta, setRowMeta] = useState<Record<number, { readOnly?: boolean; display?: string }>>({});

  // Initialize meta for existing values (e.g., preloaded file URLs) when component mounts or values change length.
  React.useEffect(() => {
    if (!initializeMeta) return;
    setRowMeta((prev) => {
      const next = { ...prev };
      internalValues.forEach((val, idx) => {
        if (next[idx]) return; // preserve existing meta
        const meta = initializeMeta(val, idx);
        if (meta && (meta.readOnly || meta.display)) {
          next[idx] = meta;
        }
      });
      return next;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initializeMeta, internalValues.length]);

  const displayValues = values.length > 0 ? values : internalValues;

  const handleChange = (index: number, value: string) => {
    const newValues = [...displayValues];
    newValues[index] = value;
    setInternalValues(newValues);
    setArray(newValues);
  };

  const handleAdd = () => {
    const newValues = [...displayValues, ""];
    setInternalValues(newValues);
    setArray(newValues);
  };

  const handleRemove = (index: number) => {
    const newValues = displayValues.filter((_, i) => i !== index);
    setInternalValues(newValues);
    setArray(newValues);
  };

  const displayLabel = legend || fieldLabel || label || "Field";

  return (
    <div className={`space-y-4 text-black ${className}`}>
      <h4 className="text-sm font-bold text-gray-700 mb-1">
        {displayLabel}
        {required && <span className="text-red-500 ml-1">*</span>}
      </h4>

      <div className="space-y-4">
        {displayValues.map((value, index) => (
          <div key={index} className="flex items-center space-x-2">
            <input
              type="text"
              name={name}
              value={rowMeta[index]?.display ?? value}
              onChange={(e) => {
                if (rowMeta[index]?.readOnly) return; // prevent editing when readOnly
                handleChange(index, e.target.value);
              }}
              placeholder={`${placeholder} ${index + 1}`}
              className={`w-full px-4 py-2 border border-gray-300 rounded-xl ${rowMeta[index]?.readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              required={required}
              readOnly={rowMeta[index]?.readOnly}
            />

            {onUpload && (
              <>
                <input
                  ref={(el) => { fileInputs.current[index] = el; }}
                  type="file"
                  className="hidden"
                  onChange={async (e) => {
                    const f = e.currentTarget.files?.[0];
                    if (!f) return;
                    try {
                      const result = await onUpload(index, f);
                      const newVal = typeof result === 'string' ? result : result?.value;
                      if (newVal) {
                        handleChange(index, newVal);
                        if (typeof result !== 'string') {
                          setRowMeta((prev) => ({
                            ...prev,
                            [index]: {
                              readOnly: result.readOnly ?? true,
                              display: result.display || f.name,
                            },
                          }));
                        } else {
                          // If only URL string returned, still lock and show filename
                          setRowMeta((prev) => ({
                            ...prev,
                            [index]: { readOnly: true, display: f.name },
                          }));
                        }
                      }
                    } catch (err) {
                      console.error('Upload failed', err);
                      alert('Upload failed');
                    } finally {
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputs.current[index]?.click()}
                  className="text-white bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded-full font-bold"
                  aria-label={uploadButtonLabel}
                >
                  {rowMeta[index]?.readOnly ? 'Replace' : uploadButtonLabel}
                </button>
              </>
            )}

            {index === displayValues.length - 1 && (
              <button
                type="button"
                onClick={handleAdd}
                className="text-white bg-green-500 hover:bg-green-600 px-3 py-1 rounded-full font-bold"
                aria-label="Add"
              >
                +
              </button>
            )}

            {displayValues.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded-full font-bold"
                aria-label="Remove"
              >
                −
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MultiForm;
