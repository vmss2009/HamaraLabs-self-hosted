import React, { useState } from "react";

interface DynamicFieldArrayProps {
  label: string;
  name: string;
  placeholder: string;
  required?: boolean;
  defaultValue?: string[];
}

export default function DynamicFieldArray({
  label,
  name,
  placeholder,
  required = false,
  defaultValue = [],
}: DynamicFieldArrayProps) {
  // Ensure defaultValue is always an array and has at least one empty field if required
  const initialFields = Array.isArray(defaultValue) && defaultValue.length > 0 
    ? defaultValue 
    : required 
      ? [""] 
      : [];

  const [fields, setFields] = useState<string[]>(initialFields);

  const addField = () => {
    setFields([...fields, ""]);
  };

  const removeField = (index: number) => {
    // Don't remove the last field if it's required
    if (required && fields.length === 1) {
      setFields([""]);
    } else {
      setFields(fields.filter((_, i) => i !== index));
    }
  };

  const updateField = (index: number, value: string) => {
    const newFields = [...fields];
    newFields[index] = value;
    setFields(newFields);
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              name={name}
              value={field}
              onChange={(e) => updateField(index, e.target.value)}
              placeholder={placeholder}
              required={required && index === 0}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => removeField(index)}
              className="px-3 py-2 text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addField}
          className="text-blue-600 hover:text-blue-800"
        >
          + Add {label}
        </button>
      </div>
    </div>
  );
} 