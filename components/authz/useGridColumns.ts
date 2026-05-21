"use client";

import { useMemo } from "react";
import { useAppAbility } from "./AbilityContext";
import type { AppSubject } from "@/lib/authz/types";

export function useGridColumns<T extends { field: string }>(
  subject: AppSubject,
  columns: T[],
  options?: { alwaysInclude?: string[] },
): T[] {
  const ability = useAppAbility();
  const alwaysInclude = options?.alwaysInclude ?? ["id", "actions"];
  return useMemo(() => {
    return columns.filter((col) => {
      if (alwaysInclude.includes(col.field)) return true;
      return ability.can("view", subject, `column.${col.field}`);
    });
  }, [ability, columns, subject, alwaysInclude]);
}
