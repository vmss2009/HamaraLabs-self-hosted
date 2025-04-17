'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MdOutlineDeleteOutline, MdAdd } from 'react-icons/md';

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
  className = '',
  label,
  name,
  placeholder = 'Enter value',
  required = false,
}) => {
  const [internalValues, setInternalValues] = useState<string[]>(values);
  
  const displayValues = values || internalValues;
  
  const handleChange = (index: number, value: string) => {
    if (onChange) {
      onChange(index, value);
    } else {
      const newValues = [...internalValues];
      newValues[index] = value;
      setInternalValues(newValues);
    }
  };
  
  const handleAdd = () => {
    if (onAdd) {
      onAdd();
    } else {
      setInternalValues([...internalValues, '']);
    }
  };
  
  const handleRemove = (index: number) => {
    if (onRemove) {
      onRemove(index);
    } else {
      const newValues = [...internalValues];
      newValues.splice(index, 1);
      setInternalValues(newValues);
    }
  };
  
  const displayLabel = legend || label || 'Field';
  const displayFieldLabel = fieldLabel || label || 'Item';
  
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex justify-between items-center">
        <div className="text-sm font-medium text-gray-800">
          {displayLabel}
          {required && <span className="text-red-500 ml-1">*</span>}
        </div>
        <Button 
          type="button" 
          onClick={handleAdd} 
          variant="outline" 
          size="sm"
          className="flex items-center gap-1 border-blue-500 text-blue-600 hover:bg-blue-50"
        >
          <MdAdd className="h-4 w-4" />
          Add {displayFieldLabel}
        </Button>
      </div>
      
      {displayValues.map((value, index) => (
        <div key={index} className="flex gap-3 items-center bg-gray-50 p-3 rounded-md">
          <div className="flex-grow">
            <Input
              name={name}
              value={value}
              onChange={(e) => handleChange(index, e.target.value)}
              placeholder={`${placeholder} ${index + 1}`}
              className="border-gray-300 bg-white"
              required={required}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => handleRemove(index)}
            className="flex-shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200"
          >
            <MdOutlineDeleteOutline className="h-5 w-5" />
          </Button>
        </div>
      ))}
      
      {displayValues.length === 0 && (
        <div className="text-sm text-gray-600 italic bg-gray-50 p-4 rounded-md border border-gray-200">
          No {displayFieldLabel.toLowerCase()}s added yet. Click the button above to add one.
        </div>
      )}
    </div>
  );
};

export default DynamicFieldArray; 