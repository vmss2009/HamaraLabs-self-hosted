"use client";

import type { ReactNode } from "react";
import { useCan } from "./useCan";
import type { AppAction, AppSubject } from "@/lib/authz/types";

export function Show({
  action,
  subject,
  field,
  fallback = null,
  children,
}: {
  action: AppAction;
  subject: AppSubject;
  field?: string;
  fallback?: ReactNode;
  children: ReactNode;
}) {
  const allowed = useCan(action, subject, field);
  return <>{allowed ? children : fallback}</>;
}

export function Hide({
  action,
  subject,
  field,
  children,
}: {
  action: AppAction;
  subject: AppSubject;
  field?: string;
  children: ReactNode;
}) {
  const allowed = useCan(action, subject, field);
  return <>{allowed ? null : children}</>;
}
