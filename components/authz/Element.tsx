"use client";

import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import { useCan } from "./useCan";
import type { AppAction, AppSubject } from "@/lib/authz/types";

export type ElementProps = {
  subject: AppSubject;
  elementKey: string;
  action?: AppAction;
  mode?: "hide" | "disable" | "readonly";
  fallback?: ReactNode;
  children: ReactNode;
};

export function Element({
  subject,
  elementKey,
  action = "view",
  mode = "hide",
  fallback = null,
  children,
}: ElementProps) {
  const allowed = useCan(action, subject, elementKey);

  if (allowed) return <>{children}</>;
  if (mode === "hide") return <>{fallback}</>;

  if (!isValidElement(children)) return <>{fallback}</>;
  const child = children as ReactElement<Record<string, unknown>>;
  const patch =
    mode === "disable"
      ? {
          disabled: true,
          "aria-disabled": "true",
          tabIndex: -1,
          onClick: undefined,
          onChange: undefined,
        }
      : { readOnly: true, "aria-readonly": "true" };
  return cloneElement(child, { ...child.props, ...patch });
}
