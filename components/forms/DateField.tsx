import React, { useState } from "react";

interface DateFieldGroupProps {
  name: string;
  required?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function formatLabel(name: string) {
  return name
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase());
}

const DateFieldGroup: React.FC<DateFieldGroupProps> = ({
  name,
  required,
  value,
  onChange
}) => {
  
  const [internalValue, setInternalValue] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e); 
    } else {
      setInternalValue(e.target.value);
    }
  };

  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {formatLabel(name)}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        type="date"
        id={name}
        name={name}
        value={value !== undefined ? value : internalValue}
        onChange={handleChange}
        className="w-full px-4 py-3 text-black border border-gray-300 rounded-xl"
        required={required}
      />
    </div>
  );
};

export default DateFieldGroup;
