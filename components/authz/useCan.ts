"use client";

import { useAppAbility } from "./AbilityContext";
import type { AppAction, AppSubject } from "@/lib/authz/types";

export function useCan(
  action: AppAction,
  subject: AppSubject,
  field?: string,
): boolean {
  const ability = useAppAbility();
  return field ? ability.can(action, subject, field) : ability.can(action, subject);
}

export function useCannot(
  action: AppAction,
  subject: AppSubject,
  field?: string,
): boolean {
  return !useCan(action, subject, field);
}
