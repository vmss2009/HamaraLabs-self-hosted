import React from "react";
import { cn } from "@/lib/utils";

export interface TextFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  multiline?: boolean;
  rows?: number;
}

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      fullWidth = false,
      multiline = false,
      rows = 1,
      id,
      name,
      ...props
    },
    ref
  ) => {
    // Use provided id/name or generate a stable id based on the name
    const fieldId = id || name || `field-${name || 'input'}`;
    
    return (
      <div className={cn("mb-4", fullWidth && "w-full")}>
        {label && (
          <label
            htmlFor={fieldId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        {multiline ? (
          <textarea
            id={fieldId}
            name={name}
            ref={ref as unknown as React.RefObject<HTMLTextAreaElement>}
            className={cn(
              "block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500",
              className
            )}
            rows={rows}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            id={fieldId}
            name={name}
            ref={ref}
            className={cn(
              "block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500",
              className
            )}
            {...props}
          />
        )}
        {(error || helperText) && (
          <p
            className={cn(
              "mt-1 text-sm",
              error ? "text-red-600" : "text-gray-500"
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

TextField.displayName = "TextField"; 