"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { FiPlus, FiX } from "react-icons/fi";

interface UserData {
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
}

interface MultipleUserInputProps {
  title: string;
  description?: string;
  users: UserData[];
  onChange: (users: UserData[]) => void;
  required?: boolean;
  minUsers?: number;
}

interface ValidationError {
  index: number;
  field: string;
  message: string;
}

export default function MultipleUserInput({
  title,
  description,
  users,
  onChange,
  required = false,
  minUsers = 0,
}: MultipleUserInputProps) {
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  // Validate emails for duplicates within the same role
  useEffect(() => {
    const errors: ValidationError[] = [];
    const emailCounts: { [email: string]: number[] } = {};

    // Count email occurrences and track indices
    users.forEach((user, index) => {
      if (user.email.trim()) {
        const email = user.email.toLowerCase().trim();
        if (!emailCounts[email]) {
          emailCounts[email] = [];
        }
        emailCounts[email].push(index);
      }
    });

    // Find duplicates
    Object.entries(emailCounts).forEach(([, indices]) => {
      if (indices.length > 1) {
        indices.forEach(index => {
          errors.push({
            index,
            field: 'email',
            message: `This email is used by multiple ${title.toLowerCase()} in this section`
          });
        });
      }
    });

    setValidationErrors(errors);
  }, [users, title]);

  const getFieldError = (index: number, field: string): string | null => {
    const error = validationErrors.find(err => err.index === index && err.field === field);
    return error ? error.message : null;
  };

  const addUser = () => {
    onChange([
      ...users,
      {
        email: "",
        first_name: "",
        last_name: "",
        phone_number: "",
      },
    ]);
  };

  const removeUser = (index: number) => {
    if (users.length > minUsers) {
      const newUsers = users.filter((_, i) => i !== index);
      onChange(newUsers);
    }
  };

  const updateUser = (index: number, field: keyof UserData, value: string) => {
    const newUsers = [...users];
    newUsers[index] = { ...newUsers[index], [field]: value };
    onChange(newUsers);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            {title} {required && <span className="text-red-500">*</span>}
          </h3>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </div>
        <Button
          type="button"
          onClick={addUser}
          size="sm"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          <FiPlus className="w-4 h-4" />
          Add {title.slice(0, -1)}
        </Button>
      </div>

      {users.length === 0 ? (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <p>No {title.toLowerCase()} added yet.</p>
          <p className="text-sm mt-1">Click &quot;Add {title.slice(0, -1)}&quot; to get started.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {users.map((user, index) => (
            <div
              key={index}
              className="relative p-6 bg-white border border-gray-200 rounded-lg shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-md font-medium text-gray-800">
                  {title.slice(0, -1)} {index + 1}
                </h4>
                {users.length > minUsers && (
                  <Button
                    type="button"
                    onClick={() => removeUser(index)}
                    size="sm"
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
                  >
                    <FiX className="w-4 h-4" />
                    Remove
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    value={user.first_name}
                    onChange={(e) => updateUser(index, "first_name", e.target.value)}
                    required={required}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={user.last_name}
                    onChange={(e) => updateUser(index, "last_name", e.target.value)}
                    required={required}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={user.email}
                      onChange={(e) => updateUser(index, "email", e.target.value)}
                      required={required}
                      className={`px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent text-black ${
                        getFieldError(index, 'email')
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {getFieldError(index, 'email') && (
                      <p className="mt-1 text-sm text-red-500">
                        {getFieldError(index, 'email')}
                      </p>
                    )}
                  </div>
                  <input
                    type="tel"
                    placeholder="WhatsApp Number"
                    value={user.phone_number || ""}
                    onChange={(e) => updateUser(index, "phone_number", e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}