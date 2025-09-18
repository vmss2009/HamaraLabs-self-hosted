import React from 'react';

type Props = {
  roomName: string;
  membersCount: number;
  loading: boolean;
  onManage: () => void;
  onBack?: () => void; // optional back button handler
  canManage?: boolean;
  onRename?: () => void;
  onDelete?: () => void;
};

export function ChatHeader({ roomName, membersCount, loading, onManage, onBack, canManage = true, onRename, onDelete }: Props) {
  return (
    <header
      className="relative z-40 h-14 flex items-center justify-between pl-14 pr-3 sm:pl-16 sm:pr-5 border-b"
      style={{ background: 'var(--surface-2)', borderColor: 'var(--border-subtle)', color: 'var(--foreground)' }}
    >
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Back"
            title="Back"
            className="h-9 w-9 grid place-items-center rounded-md border transition-colors"
            style={{ background: 'color-mix(in srgb, var(--foreground) 6%, transparent)', borderColor: 'color-mix(in srgb, var(--foreground) 18%, transparent)' }}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        <div className="flex flex-col">
          <h1 className="font-semibold text-sm leading-tight truncate max-w-[40vw]" title={roomName}>{roomName}</h1>
          <span className="text-[10px] opacity-60 leading-none mt-0.5">{membersCount} member{membersCount === 1 ? '' : 's'}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 text-[11px]">
        {loading && <span className="animate-pulse opacity-70">Loading…</span>}
        <button
          className="px-2 py-1 rounded-md border transition-colors"
          style={{ background: 'color-mix(in srgb, var(--foreground) 6%, transparent)', borderColor: 'color-mix(in srgb, var(--foreground) 18%, transparent)' }}
          onClick={onManage}
        >
          Members • {membersCount}
        </button>
        {canManage && (
          <div className="flex items-center gap-2">
            {onRename && (
              <button
                className="px-2 py-1 rounded-md border transition-colors"
                style={{ background: 'color-mix(in srgb, var(--foreground) 6%, transparent)', borderColor: 'color-mix(in srgb, var(--foreground) 18%, transparent)' }}
                onClick={onRename}
                title="Rename chat"
                aria-label="Rename chat"
              >
                Rename
              </button>
            )}
            {onDelete && (
              <button
                className="px-2 py-1 rounded-md text-white"
                style={{ background: 'color-mix(in srgb, var(--foreground) 85%, transparent)' }}
                onClick={onDelete}
                title="Delete chat"
                aria-label="Delete chat"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
