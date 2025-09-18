import React from 'react';

type Props = {
  roomName: string;
  membersCount: number;
  loading: boolean;
  onManage: () => void;
  onBack?: () => void; // optional back button handler
  canManage?: boolean;
};

export function ChatHeader({ roomName, membersCount, loading, onManage, onBack, canManage = true }: Props) {
  return (
    <header className="relative z-40 mt-4 h-10 flex items-center justify-between pl-14 pr-3 sm:pl-16 sm:pr-5 border-b border-slate-800/70 bg-slate-900/60 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Back"
            title="Back"
            className="h-9 w-9 grid place-items-center rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700/70"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        <div className="flex flex-col">
        <h1 className="font-semibold text-sm leading-tight">{roomName}</h1>
        </div>
      </div>
      <div className="flex items-center gap-2 text-[10px] text-slate-500">
        {loading && <span className="animate-pulse">Loading…</span>}
        {canManage && (
          <button
            className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700/70 text-[11px]"
            onClick={onManage}
          >
            Members • {membersCount}
          </button>
        )}
      </div>
    </header>
  );
}