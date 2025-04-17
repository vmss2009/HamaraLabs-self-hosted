import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TextFieldGroupProps extends InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label: string;
  error?: string;
  multiline?: boolean;
  rows?: number;
}

export const TextFieldGroup = forwardRef<HTMLInputElement | HTMLTextAreaElement, TextFieldGroupProps>(
  ({ className, label, error, multiline, rows = 1, ...props }, ref) => {
    const baseStyles = "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50";
    
    return (
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        {multiline ? (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            className={cn(baseStyles, "min-h-[80px] resize-y", className)}
            rows={rows}
            {...props}
          />
        ) : (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            className={cn(baseStyles, className)}
            {...props}
          />
        )}
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

TextFieldGroup.displayName = "TextFieldGroup"; 