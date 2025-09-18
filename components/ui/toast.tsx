import * as React from "react";
import { cn } from "@/lib/utils";

export type ToastProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  children?: React.ReactNode;
  variant?: "default" | "destructive";
};

export type ToastActionElement = React.ReactNode;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export const ToastViewport = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
        className
      )}
      {...props}
    />
  )
);
ToastViewport.displayName = "ToastViewport";

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(({ className, variant = "default", ...props }, ref) => {
  const style: React.CSSProperties = {
    background:
      variant === "destructive"
        ? "color-mix(in srgb, var(--foreground) 10%, transparent)"
        : "var(--background)",
    color: "var(--foreground)",
    borderColor:
      variant === "destructive"
        ? "color-mix(in srgb, var(--foreground) 35%, transparent)"
        : "color-mix(in srgb, var(--foreground) 20%, transparent)",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "group relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all",
        className
      )}
      style={style}
      {...props}
    />
  );
});
Toast.displayName = "Toast";

export const ToastAction = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors",
        className
      )}
      style={{
        color: "var(--foreground)",
        borderColor: "color-mix(in srgb, var(--foreground) 25%, transparent)",
      }}
      {...props}
    />
  )
);
ToastAction.displayName = "ToastAction";

export const ToastClose = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "absolute right-2 top-2 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2",
        className
      )}
      style={{
        color: "var(--foreground)",
        borderColor: "color-mix(in srgb, var(--foreground) 25%, transparent)",
      }}
      aria-label="Close"
      {...props}
    >
      ×
    </button>
  )
);
ToastClose.displayName = "ToastClose";

export const ToastTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-sm font-semibold", className)} style={{ color: "var(--foreground)" }} {...props} />
  )
);
ToastTitle.displayName = "ToastTitle";

export const ToastDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-sm opacity-90", className)} style={{ color: "var(--foreground)" }} {...props} />
  )
);
ToastDescription.displayName = "ToastDescription";
