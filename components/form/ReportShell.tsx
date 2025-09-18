"use client";

import React from "react";

type ReportShellProps = {
  children: React.ReactNode;
};

export default function ReportShell({ children }: ReportShellProps) {
  return (
    <div className="flex justify-center items-start min-h-screen w-screen bg-gray-500">
      <div className="pt-20 w-full">
        {children}
      </div>
    </div>
  );
}
