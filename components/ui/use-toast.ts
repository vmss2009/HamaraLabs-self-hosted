"use client";

import * as React from "react";
import { useNotifications } from "@/components/ui/notifications";

type ToastOptions = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: "default" | "destructive";
};

function useToast() {
  const { notify, dismiss } = useNotifications();

  const toast = React.useCallback(
    ({ title, description, variant = "default" }: ToastOptions) => {
      const id = notify({
        title: typeof title === "string" ? title : String(title ?? ""),
        description: typeof description === "string" ? description : undefined,
        variant,
      });
      return {
        id,
        dismiss: () => dismiss(id),
        update: (_opts: ToastOptions) => {},
      } as const;
    },
    [notify, dismiss]
  );

  return {
    toasts: [] as never[],
    toast,
    dismiss,
  } as const;
}

export { useToast };
