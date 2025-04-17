'use client';

import React from 'react';
import { Input } from '@/components/ui/Input';

interface Field {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}

interface TextFieldGroupProps {
  fields: Field[];
  className?: string;
}

const TextFieldGroup: React.FC<TextFieldGroupProps> = ({
  fields,
  className = '',
}) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5 ${className}`}>
      {fields.map((field) => (
        <div key={field.name} className="w-full">
          <Input
            name={field.name}
            label={field.label}
            type={field.type || 'text'}
            required={field.required}
            placeholder={field.placeholder}
            className="focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      ))}
    </div>
  );
};

export default TextFieldGroup; 