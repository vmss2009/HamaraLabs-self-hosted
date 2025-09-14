"use client";

import React, { useMemo, useState, useId } from "react";
import { Checkbox } from "@/components/Checkbox";

export type MultiSelectOption = { value: string; label: string };

interface MultiSelectProps {
  label?: string;
  options: MultiSelectOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  className?: string;
  required?: boolean;
}

export default function MultiSelect({
  label,
  options,
  selectedValues,
  onChange,
  placeholder = "Search...",
  disabled = false,
  searchable = true,
  className = "",
  required = false,
}: MultiSelectProps) {
  const [query, setQuery] = useState("");
  const uid = useId();

  const labelId = `${uid}-label`;
  const listId = `${uid}-list`;
  const searchId = `${uid}-search`;
  const selectAllId = `${uid}-select-all`;
  const liveId = `${uid}-live`;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  const totalCount = options.length;
  const filteredCount = filtered.length;

  const toggle = (value: string, checked: boolean) => {
    if (checked) {
      onChange([...new Set([...selectedValues, value])]);
    } else {
      onChange(selectedValues.filter((v) => v !== value));
    }
  };

  const allChecked = selectedValues.length === options.length && options.length > 0;
  const indeterminate = selectedValues.length > 0 && selectedValues.length < options.length;

  const toggleAll = (checked: boolean) => {
    if (checked) onChange(options.map((o) => o.value));
    else onChange([]);
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label id={labelId} className="block text-sm font-bold text-gray-800 mb-1.5">
          {label} {required && <span className="text-red-600">*</span>}
        </label>
      )}

      {/* announce filter counts to assistive tech */}
      <div id={liveId} aria-live="polite" className="sr-only">
        {filteredCount} of {totalCount} options
      </div>

      {searchable && (
        <input
          id={searchId}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          aria-label={label ? `${label} search` : "Search"}
          aria-controls={listId}
          aria-describedby={liveId}
          disabled={disabled}
          className="mb-2 w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
        />
      )}

      <div className="mb-2">
        <label className="inline-flex items-center gap-2 text-sm text-gray-700" htmlFor={selectAllId}>
          <input
            id={selectAllId}
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-blue-700 focus:ring-blue-600"
            checked={allChecked}
            ref={(el) => {
              if (el) el.indeterminate = indeterminate;
            }}
            aria-checked={allChecked ? "true" : indeterminate ? "mixed" : "false"}
            aria-controls={listId}
            onChange={(e) => toggleAll(e.target.checked)}
          />
          <span>
            Select All <span className="text-gray-500">({options.length})</span>
          </span>
        </label>
      </div>

      <div
        id={listId}
        role="group"
        aria-labelledby={labelId}
        className="max-h-60 overflow-auto rounded-md border border-gray-200 divide-y divide-gray-100"
      >
        {filtered.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer"
            htmlFor={`${uid}-${option.value}`}
          >
            <Checkbox
              id={`${uid}-${option.value}`}
              checked={selectedValues.includes(option.value)}
              onChange={(e) => toggle(option.value, e.target.checked)}
              disabled={disabled}
            />
            <span className="text-gray-800">{option.label}</span>
          </label>
        ))}
        {filtered.length === 0 && (
          <div className="px-3 py-2 text-sm text-gray-500">No options</div>
        )}
      </div>
    </div>
  );
}
