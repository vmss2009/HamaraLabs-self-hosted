"use client";

import React, { useState } from "react";

interface MultiFormProps {
  values?: string[];
  legend?: string;
  setArray: (newArray: string[]) => void; // <-- changed here
  fieldLabel?: string;
  className?: string;
  label?: string;
  name?: string;
  placeholder?: string;
  required?: boolean;
}

const MultiForm: React.FC<MultiFormProps> = ({
  values = [],
  legend,
  setArray,
  fieldLabel,
  className = "",
  label,
  name,
  placeholder = "",
  required = false,
}) => {
  const [internalValues, setInternalValues] = useState<string[]>(
    values.length > 0 ? values : [""]
  );

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

  const displayLabel = legend || label || "Field";
  const displayFieldLabel = fieldLabel || label || "Item";

  return (
    <div className={`space-y-4 text-black ${className}`}>
      <h4 className="text-lg font-bold text-gray-700 mb-4">
        {displayLabel}
        {required && <span className="text-red-500 ml-1">*</span>}
      </h4>

      <div className="space-y-4">
        {displayValues.map((value, index) => (
          <div key={index} className="flex items-center space-x-2">
            <input
              type="text"
              name={name}
              value={value}
              onChange={(e) => handleChange(index, e.target.value)}
              placeholder={`${placeholder} ${index + 1}`}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl"
              required={required}
            />

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
