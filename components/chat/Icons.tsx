import React from 'react';
import clsx from 'clsx';

export function IconFiMenu({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className}>
      <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
export function IconFiX({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className}>
      <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
export function IconSend({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className}>
      <path d="M22 2 11 13" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="m22 2-7 20-4-9-9-4 20-7Z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
export function IconBold({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor"><path d="M7 4h6.5a3.5 3.5 0 0 1 0 7H7V4zm0 9h7a3.5 3.5 0 1 1 0 7H7v-7z"/></svg>
  );
}
export function IconItalic({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor"><path d="M10 4h8v2h-3.8l-4.4 12H16v2H8v-2h3.8l4.4-12H10V4z"/></svg>
  );
}
export function IconStrikethrough({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor"><path d="M4 11h16v2H4v-2zm6.5 6c0 1 .8 2 2.5 2s2.5-1 2.5-2-.7-1.6-2.4-2.2l-1.1-.4c-2.5-.8-3.9-2-3.9-4.2h2.3c0 1.2.7 1.9 2.6 2.5l1 .3c2.8.9 4 2.1 4 4.1 0 2.2-1.8 4-4.8 4S8.5 19.9 8.5 18h2z"/></svg>
  );
}
export function IconCode({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M8 16 4 12l4-4" strokeLinecap="round" strokeLinejoin="round"/><path d="m16 8 4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/></svg>
  );
}
export function IconPilcrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor"><path d="M10 4h2v16h-2V4zm6 0h2v16h-2V4zM8 10a4 4 0 1 0 0 8h2v-8H8z"/></svg>
  );
}
export function IconListBullet({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor"><circle cx="5" cy="6" r="1.5"/><circle cx="5" cy="12" r="1.5"/><circle cx="5" cy="18" r="1.5"/><path d="M10 6h10v2H10zM10 12h10v2H10zM10 18h10v2H10z"/></svg>
  );
}
export function IconListOrdered({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor"><path d="M4 6h2V4H3v2h1zM3 12h3v-2H3v2zm0 6h3v-2H3v2z"/><path d="M10 6h10v2H10zM10 12h10v2H10zM10 18h10v2H10z"/></svg>
  );
}
export function IconBraces({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 3c-2 0-3 1-3 3v3c0 1-1 2-2 2 1 0 2 1 2 2v3c0 2 1 3 3 3"/><path d="M15 3c2 0 3 1 3 3v3c0 1 1 2 2 2-1 0-2 1-2 2v3c0 2-1 3-3 3"/></svg>
  );
}
export function IconQuote({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor"><path d="M5 7h7v6H8v4H5V7zm9 0h7v6h-4v4h-3V7z"/></svg>
  );
}
export function IconHR({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor"><rect x="4" y="11" width="16" height="2"/></svg>
  );
}
export function IconReturn({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 7v6a3 3 0 0 1-3 3H6" strokeLinecap="round"/><path d="M9 10 6 13l3 3" strokeLinecap="round" strokeLinejoin="round"/></svg>
  );
}
export function IconUndo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 7 5 11l4 4" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 11h9a5 5 0 1 1 0 10h-3" strokeLinecap="round"/></svg>
  );
}
export function IconRedo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M15 7 19 11l-4 4" strokeLinecap="round" strokeLinejoin="round"/><path d="M19 11H10a5 5 0 1 0 0 10h3" strokeLinecap="round"/></svg>
  );
}
export function IconPalette({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M5 18h14" strokeLinecap="round"/>
      <path d="M12 5l5 12H7L12 5z" fill="currentColor"/>
    </svg>
  );
}
export function IconMath({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 7h16M8 7l8 10M8 17l8-10"/></svg>
  );
}
export function IconResizeNS({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 3v8" strokeLinecap="round"/>
      <path d="M9 6l3-3 3 3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 21v-8" strokeLinecap="round"/>
      <path d="M9 18l3 3 3-3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
export function IconCheck({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
  );
}
export function IconX({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 6l12 12M6 18L18 6" strokeLinecap="round"/></svg>
  );
}
export function IconPaperclip({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M8 12.5 15.5 5a3.5 3.5 0 1 1 5 5l-8.5 8.5a5 5 0 0 1-7.1-7.1L12 4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
export function IconMic({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="9" y="3" width="6" height="10" rx="3"/>
      <path d="M5 10v1a7 7 0 0 0 14 0v-1"/>
      <path d="M12 21v-3"/>
    </svg>
  );
}
export function IconStop({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
  );
}
export function IconPlus({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 5v14M5 12h14" strokeLinecap="round"/></svg>
  );
}
export function IconMinus({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 12h14" strokeLinecap="round"/></svg>
  );
}
export function IconAlignLeft({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 6h16" strokeLinecap="round"/>
      <rect x="4" y="9" width="12" height="3" rx="1" />
      <rect x="4" y="14" width="16" height="3" rx="1" />
    </svg>
  );
}
export function IconAlignCenter({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 6h16" strokeLinecap="round"/>
      <rect x="6" y="9" width="12" height="3" rx="1" />
      <rect x="4" y="14" width="16" height="3" rx="1" />
    </svg>
  );
}
export function IconAlignRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 6h16" strokeLinecap="round"/>
      <rect x="8" y="9" width="12" height="3" rx="1" />
      <rect x="4" y="14" width="16" height="3" rx="1" />
    </svg>
  );
}
export function IconAlignJustify({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M4 6h16" strokeLinecap="round"/>
      <rect x="4" y="9" width="16" height="3" rx="1" />
      <rect x="4" y="14" width="16" height="3" rx="1" />
    </svg>
  );
}
export function IconTable({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="5" width="18" height="14" rx="2"/>
      <path d="M3 9h18M8 5v14M16 5v14"/>
    </svg>
  );
}
export function IconSpinner({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={clsx('animate-spin', className)} fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" className="opacity-25" />
      <path d="M4 12a8 8 0 0 1 8-8" className="opacity-75" />
    </svg>
  );
}
