"use client";

import React from "react";
import { Button } from "@/components/ui/Button";

interface RadioOption {
  value: string;
  label: string;
}

interface RadioButtonGroupProps {
  name: string;
  legend: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
}

const RadioButtonGroup: React.FC<RadioButtonGroupProps> = ({
  name,
  legend,
  options,
  value,
  onChange,
  required = false,
  className = "",
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="text-sm font-medium text-gray-800 mb-2">
        {legend} {required && <span className="text-red-600">*</span>}
      </div>
      <div className="flex flex-wrap gap-3">
        {options.map((option) => (
          <Button
            key={option.value}
            type="button"
            variant={value === option.value ? "default" : "outline"}
            size="sm"
            onClick={() => onChange(option.value)}
            className={
              value === option.value
                ? "bg-blue-600 hover:bg-blue-700"
                : "border-gray-300 text-gray-800"
            }
          >
            {option.label}
          </Button>
        ))}
        <input type="hidden" name={name} value={value} required={required} />
      </div>
    </div>
  );
};

export default RadioButtonGroup;
