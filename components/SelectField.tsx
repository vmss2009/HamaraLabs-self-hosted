"use client";

import React from "react";
import { Select, SelectOption } from "@/components/Select";

interface SelectFieldProps {
  name: string;
  label: string;
  options: SelectOption[];
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  value?: string | number;
  required?: boolean;
  className?: string;
  error?: string;
  placeholder?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({
  name,
  label,
  options,
  onChange,
  value,
  required = false,
  className = "",
  error,
  placeholder,
}) => {
  return (
    <div className={`w-full ${className}`} data-placeholder={placeholder}>
      <Select
        name={name}
        label={label}
        options={options}
        onChange={onChange}
        value={value?.toString()}
        required={required}
        error={error}
        className="focus:border-blue-500  focus:ring-blue-500 shadow-sm"
      />
    </div>
  );
};

export default SelectField;
