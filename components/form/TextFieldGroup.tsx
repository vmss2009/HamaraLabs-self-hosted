import React from "react";

type Field = {
  name: string;
  label: string;
  showLabel?: boolean; // when false, label won't be rendered visually
  required?: boolean;
  type?: string;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  helperText?: string;
  disabled?: boolean;
  value?: string | number;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
};

interface TextFieldGroupProps {
  fields: Field[];
}

function TextFieldGroup({ fields }: TextFieldGroupProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {fields.map((field) => {
        const wrapperClasses = [
          "flex flex-col",
          field.name === "comments" ? "md:col-span-2" : "",
        ].join(" ");
        const showLabel = field.showLabel !== false;

        return (
          <div key={field.name} className={wrapperClasses}>
            {showLabel && (
              <label
                htmlFor={field.name}
                className="mb-2 font-semibold text-gray-700"
              >
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}

            {field.multiline ? (
              <>
                <textarea
                  id={field.name}
                  name={field.name}
                  rows={field.rows || 4}
                  required={field.required}
                  disabled={field.disabled}
                  value={field.value}
                  onChange={field.onChange}
                  aria-label={!showLabel ? field.label : undefined}
                  aria-describedby={field.helperText ? `${field.name}-helper` : undefined}
                  className={`p-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                    field.disabled ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                />
                {field.helperText && (
                  <p id={`${field.name}-helper`} className="mt-1 text-sm text-gray-500">
                    {field.helperText}
                  </p>
                )}
              </>
            ) : (
              <>
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type || "text"}
                  required={field.required}
                  placeholder={field.placeholder}
                  disabled={field.disabled}
                  value={field.value}
                  onChange={field.onChange}
                  aria-label={!showLabel ? field.label : undefined}
                  aria-describedby={field.helperText ? `${field.name}-helper` : undefined}
                  className={`p-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none ${
                    field.disabled ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                />
                {field.helperText && (
                  <p id={`${field.name}-helper`} className="mt-1 text-sm text-gray-500">
                    {field.helperText}
                  </p>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default TextFieldGroup;
