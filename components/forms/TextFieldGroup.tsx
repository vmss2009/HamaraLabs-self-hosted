import React from "react";

type Field = {
  name: string;
  label: string;
  required?: boolean;
  type?: string;
  multiline?: boolean;
  rows?: number;
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
          field.name === "comments" ? "md:col-span-2" : ""
        ].join(" ");

        return (
          <div key={field.name} className={wrapperClasses}>
            <label
              htmlFor={field.name}
              className="mb-2 font-semibold text-gray-700"
            >
              {field.label}
              {field.required && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </label>

            {field.multiline ? (
              <textarea
                id={field.name}
                name={field.name}
                rows={field.rows || 4}
                required={field.required}
                className="p-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              />
            ) : (
              <input
                id={field.name}
                name={field.name}
                type={field.type || "text"}
                required={field.required}
                className="p-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default TextFieldGroup;
