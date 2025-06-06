"use client";

import React from "react";
import { Checkbox } from "@/components/ui/Checkbox";

interface CheckboxOption {
  value: string;
  label: string;
}

interface CheckboxGroupProps {
  options: CheckboxOption[];
  legend: string;
  onChange: (value: string, checked: boolean) => void;
  selectedValues: string[];
  className?: string;
  required?: boolean;
}

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  options,
  legend,
  onChange,
  selectedValues,
  className = "",
  required = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value, e.target.checked);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="text-sm font-bold text-gray-800 mb-2">
        {legend} {required && <span className="text-red-600">*</span>}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {options.map((option) => (
          <div
            key={option.value}
            className="bg-gray-50 hover:bg-gray-100 rounded-md p-2 transition-colors"
          >
            <Checkbox
              key={option.value}
              label={option.label}
              value={option.value}
              checked={selectedValues.includes(option.value)}
              onChange={handleChange}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CheckboxGroup;
