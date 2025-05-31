"use client";

import React, { useState } from "react";

interface DynamicFieldArrayProps {
  values?: string[];
  onChange?: (index: number, value: string) => void;
  onAdd?: () => void;
  onRemove?: (index: number) => void;
  legend?: string;
  fieldLabel?: string;
  className?: string;
  label?: string;
  name?: string;
  placeholder?: string;
  required?: boolean;
}

const DynamicFieldArray: React.FC<DynamicFieldArrayProps> = ({
  values = [],
  onChange,
  onAdd,
  onRemove,
  legend,
  fieldLabel,
  className = "",
  label,
  name,
  placeholder = "",
  required = false,
}) => {
  const [internalValues, setInternalValues] = useState<string[]>(
    values.length > 0 ? values : [""],
  );

  const displayValues = values.length > 0 ? values : internalValues;

  const handleChange = (index: number, value: string) => {
    if (onChange) {
      onChange(index, value);
    } else {
      const updated = [...internalValues];
      updated[index] = value;
      setInternalValues(updated);
    }
  };

  const handleAdd = () => {
    if (onAdd) {
      onAdd();
    } else {
      setInternalValues([...internalValues, ""]);
    }
  };

  const handleRemove = (index: number) => {
    if (onRemove) {
      onRemove(index);
    } else {
      const updated = [...internalValues];
      updated.splice(index, 1);
      setInternalValues(updated);
    }
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

            {/* Add button only for last item */}
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

            {/* Remove button shown when more than 1 item */}
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

export default DynamicFieldArray;
