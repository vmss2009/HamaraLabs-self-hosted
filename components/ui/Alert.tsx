"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface AlertProps {
  type?: "error" | "success" | "info" | "warning";
  severity?: "error" | "success" | "info" | "warning";
  children: React.ReactNode;
  className?: string;
  sx?: React.CSSProperties;
}

const styles: Record<NonNullable<AlertProps["type"]>, string> = {
  error:
    "border-red-200 bg-red-50 text-red-700",
  success:
    "border-green-200 bg-green-50 text-green-700",
  info:
    "border-blue-200 bg-blue-50 text-blue-700",
  warning:
    "border-yellow-200 bg-yellow-50 text-yellow-800",
};

export default function Alert({ type = "info", severity, children, className, sx }: AlertProps) {
  const variant = severity ?? type;
  return (
    <div
      className={cn(
        "mb-4 rounded-md border px-4 py-3 text-sm",
        styles[variant],
        className
      )}
      style={sx}
    >
      {children}
    </div>
  );
}
