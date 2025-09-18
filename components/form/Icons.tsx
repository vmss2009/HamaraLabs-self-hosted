"use client";

import React from "react";

export function EditIcon({ className = "w-5 h-5", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`text-gray-700 ${className}`}
      style={style}
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm14.71-9.21 1.13-1.13c.39-.39.39-1.02 0-1.41L16.5 2.96a.9959.9959 0 0 0-1.41 0l-1.13 1.13 3.75 3.75z" />
    </svg>
  );
}

export function DeleteIcon({ className = "w-5 h-5", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`text-red-600 dark:text-red-400 ${className}`}
      style={style}
    >
      <path d="M6 7h12v2H6V7zm2 4h8v9a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-9zm3-7h2a1 1 0 0 1 1 1v1H8V5a1 1 0 0 1 1-1z" />
    </svg>
  );
}
