"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createContextualCan } from "@casl/react";
import { AppAbility, type SerializedRule } from "@/lib/authz/types";
import { abilityFromRules } from "@/lib/authz/ability";

const emptyAbility = abilityFromRules([]);

export const AbilityContext = createContext<InstanceType<typeof AppAbility>>(
  emptyAbility,
);

export const Can = createContextualCan(AbilityContext.Consumer);

type AbilityMeta = {
  ready: boolean;
  refresh: () => Promise<void>;
};
const AbilityMetaContext = createContext<AbilityMeta>({
  ready: false,
  refresh: async () => {},
});

export function useAppAbility() {
  return useContext(AbilityContext);
}

export function useAbilityMeta() {
  return useContext(AbilityMetaContext);
}

export function AbilityProvider({
  children,
  initialRules,
  endpoint = "/api/authz/me",
}: {
  children: ReactNode;
  initialRules?: SerializedRule[];
  endpoint?: string;
}) {
  const [rules, setRules] = useState<SerializedRule[] | null>(
    initialRules ?? null,
  );
  const [ready, setReady] = useState<boolean>(Boolean(initialRules));
  const fetchOnce = useRef(false);

  const ability = useMemo(() => abilityFromRules(rules ?? []), [rules]);

  const refresh = async () => {
    const res = await fetch(endpoint, { cache: "no-store" });
    if (!res.ok) {
      setRules([]);
      setReady(true);
      return;
    }
    const data = (await res.json()) as { rules: SerializedRule[] };
    setRules(data.rules ?? []);
    setReady(true);
  };

  useEffect(() => {
    // Always fetch fresh rules after mount so that mid-session permission
    // changes made by an admin take effect without requiring a hard reload.
    // initialRules (from SSR) are used immediately — no loading flash.
    if (!fetchOnce.current) {
      fetchOnce.current = true;
      void refresh();
    }

    // Re-fetch when the user switches back to this tab, in case an admin
    // changed their permissions while they were away.
    const handleVisibility = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const meta: AbilityMeta = useMemo(
    () => ({ ready, refresh }),
    [ready],
  );

  return (
    <AbilityContext.Provider value={ability}>
      <AbilityMetaContext.Provider value={meta}>
        {children}
      </AbilityMetaContext.Provider>
    </AbilityContext.Provider>
  );
}
