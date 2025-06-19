"use client";

import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/Card";

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  className = "",
}) => {
  return (
    <Card
      className={`mb-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow ${className}`}
    >
      <CardHeader className="bg-blue-50 border-b border-gray-200">
        <CardTitle className="text-blue-800">{title}</CardTitle>
        {description && (
          <CardDescription className="text-gray-600 mt-1">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="bg-white p-6">{children}</CardContent>
    </Card>
  );
};

export default FormSection;
