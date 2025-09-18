"use client";

import React, { useMemo, useRef, useEffect, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import { cn } from "@/lib/utils";

export type Option = { value: string | number; label: string };

export interface SearchableSelectProps<TValue extends string | number = string> {
  label?: string;
  placeholder?: string;
  options: Option[];
  value: TValue | TValue[] | null;
  onChange: (value: TValue | TValue[] | null) => void;
  multiple?: boolean;
  disabled?: boolean;
  size?: "small" | "medium";
  className?: string;
  virtualizeThreshold?: number; // auto-enable virtualization when options exceed this
}

// Lightweight virtualized ListBox for MUI Autocomplete without external deps
function VirtualizedListBox(props: React.HTMLAttributes<HTMLElement>) {
  const { children, style, ...other } = props as any;
  const itemData = React.Children.toArray(children);
  const total = itemData.length;
  const itemHeight = 40; // px per row
  const maxVisible = 8;
  const height = Math.min(maxVisible, total) * itemHeight;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop((e.currentTarget as HTMLDivElement).scrollTop);
  };

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - 1); // buffer
  const visibleCount = Math.ceil(height / itemHeight) + 2;
  const endIndex = Math.min(total, startIndex + visibleCount);
  const offsetY = startIndex * itemHeight;

  return (
    <div
      {...other}
      ref={containerRef}
      onScroll={onScroll}
      style={{
        ...style,
        position: "relative",
        overflow: "auto",
        maxHeight: height,
      }}
    >
      <div style={{ height: total * itemHeight, position: "relative" }}>
        <div style={{ position: "absolute", top: offsetY, left: 0, right: 0 }}>
          {itemData.slice(startIndex, endIndex).map((child: any, idx: number) => (
            <div key={startIndex + idx} style={{ height: itemHeight }}>{child}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SearchableSelect<TValue extends string | number = string>({
  label,
  placeholder = "Search...",
  options,
  value,
  onChange,
  multiple = false,
  disabled = false,
  size = "small",
  className,
  virtualizeThreshold = 200,
}: SearchableSelectProps<TValue>) {
  // memoize lookups
  const byValue = useMemo(() => {
    const m = new Map<string, Option>();
    for (const o of options) m.set(String(o.value), o);
    return m;
  }, [options]);

  const getOption = (val: string | number | null | undefined): Option | null => {
    if (val === null || val === undefined) return null;
    return byValue.get(String(val)) ?? null;
  };

  const getOptionLabel = (opt: Option) => opt.label ?? String(opt.value);

  const handleChange = (_: any, newValue: Option | Option[] | null) => {
    if (multiple) {
      const vals = (Array.isArray(newValue) ? newValue : newValue ? [newValue] : [])
        .map((o) => o.value as TValue);
      onChange(vals as TValue[]);
      return;
    }
    onChange((newValue ? (newValue as Option).value : null) as TValue | null);
  };

  const computedValue = multiple
    ? ((Array.isArray(value) ? value : value ? [value] : [])
        .map((v) => getOption(v as string | number))
        .filter(Boolean) as Option[])
    : (getOption((value as TValue | null) ?? null) as Option | null);

  const useVirtual = options.length >= virtualizeThreshold;

  return (
    <div className={cn("w-full", className)}>
      <Autocomplete
        multiple={multiple}
        disableCloseOnSelect={multiple}
        options={options}
        size={size}
        getOptionLabel={getOptionLabel}
        isOptionEqualToValue={(a, b) => String(a.value) === String(b.value)}
        value={computedValue}
        onChange={handleChange}
        ListboxComponent={useVirtual ? (VirtualizedListBox as any) : undefined}
        renderOption={(props, option, { selected }) => (
          <li {...props} key={String(option.value)}>
            {multiple ? (
              <>
                <Checkbox style={{ marginRight: 8 }} checked={selected} />
                {option.label}
              </>
            ) : (
              option.label
            )}
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            placeholder={placeholder}
            size={size}
          />
        )}
        disabled={disabled}
      />
    </div>
  );
}
