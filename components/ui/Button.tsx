"use client";

import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none shadow-sm",
  {
    variants: {
      variant: {
        default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
        outline:
          "border border-gray-300 bg-white hover:bg-gray-50 text-gray-700",
        secondary:
          "bg-gray-100 text-gray-900 hover:bg-gray-200 border border-gray-200",
        ghost: "bg-transparent hover:bg-gray-100 text-gray-700",
        link: "bg-transparent underline-offset-4 hover:underline text-blue-600 shadow-none",
        success:
          "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 px-3 text-xs rounded-md",
        lg: "h-12 px-8 text-base rounded-lg",
        icon: "h-10 w-10 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, isLoading = false, children, ...props },
    ref
  ) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
