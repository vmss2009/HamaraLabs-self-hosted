import React from "react";

interface Field {
  name: string;
  label: string;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  defaultValue?: string;
}

interface TextFieldGroupProps {
  fields: Field[];
}

export default function TextFieldGroup({ fields }: TextFieldGroupProps) {
  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <div key={field.name} className="mb-4">
          <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 mb-1">
            {field.label}
          </label>
          {field.multiline ? (
            <textarea
              id={field.name}
              name={field.name}
              required={field.required}
              rows={field.rows || 4}
              defaultValue={field.defaultValue}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          ) : (
            <input
              type="text"
              id={field.name}
              name={field.name}
              required={field.required}
              defaultValue={field.defaultValue}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          )}
        </div>
      ))}
    </div>
  );
} 