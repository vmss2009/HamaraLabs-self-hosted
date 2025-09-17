import React, { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

export interface Room { id: string; name: string; _count?: { messages: number }; }

type Props = {
  rooms: Room[];
  roomsLoading: boolean;
  activeRoom: string | null;
  onSelectRoom: (id: string) => void;
  onCreateRoom: () => void;
  sidebarOpen?: boolean;
  setSidebarOpen?: (open: boolean) => void;
};

export function ChatSidebar({ rooms, roomsLoading, activeRoom, onSelectRoom, onCreateRoom, sidebarOpen, setSidebarOpen }: Props) {
  const [width, setWidth] = useState<number>(320);
  const startXRef = useRef(0);
  const startWRef = useRef(320);

  useEffect(() => {
    try {
      const saved = typeof window !== 'undefined' ? Number(localStorage.getItem('chatSidebarWidth')) : 0;
      if (saved && saved >= 240) setWidth(saved);
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem('chatSidebarWidth', String(width)); } catch {}
  }, [width]);

  const onResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    startXRef.current = e.clientX;
    startWRef.current = width;
    const onMove = (ev: MouseEvent) => {
      const delta = ev.clientX - startXRef.current;
      const minW = 240;
      const maxW = Math.min(Math.floor(window.innerWidth * 0.5), 560);
      const next = Math.max(minW, Math.min(maxW, startWRef.current + delta));
      setWidth(next);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  const [internalOpen, setInternalOpen] = useState<boolean>(true);
  const open = typeof sidebarOpen === 'boolean' ? sidebarOpen : internalOpen;
  const setOpenSafe = (next: boolean | ((prev: boolean) => boolean)) => {
    if (typeof sidebarOpen === 'boolean' && setSidebarOpen) {
      const resolved = typeof next === 'function' ? (next as (p: boolean) => boolean)(sidebarOpen) : next;
      setSidebarOpen(resolved);
    } else {
      setInternalOpen(next as React.SetStateAction<boolean>);
    }
  };
  const toggleDrawer = () => setOpenSafe((v: boolean) => !v);

  return (
    <>
      <button
        onClick={toggleDrawer}
        className="fixed top-2 left-2 z-40 h-9 w-9 grid place-items-center rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700/70 shadow"
        aria-label={open ? 'Close chats sidebar' : 'Open chats sidebar'}
        title={open ? 'Close chats' : 'Open chats'}
      >
        {open ? (
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M6 6l12 12M6 18L18 6" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
          </svg>
        )}
      </button>

      <aside
        className={clsx(
          'relative flex flex-col shrink-0 h-full backdrop-blur-xl bg-slate-900/40 transition-[width] duration-300 overflow-hidden',
          open ? 'border-r border-slate-800/70' : 'border-r border-transparent'
        )}
        style={{ width: open ? width : 0 }}
        aria-hidden={!open}
      >
      <div className="p-3 flex items-center justify-end border-b border-slate-800/70">
        {open && (
          <button className="text-[11px] px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 border border-slate-600/70" onClick={onCreateRoom}>
            New
          </button>
        )}
      </div>
  <div className={clsx('relative flex-1 overflow-y-auto custom-scroll pb-10 transition-opacity', !open && 'opacity-0 pointer-events-none')}
      >
        {roomsLoading && <div className="p-4 text-xs text-slate-500 animate-pulse">Loading rooms…</div>}
        {!roomsLoading && !rooms.length && <div className="p-4 text-xs text-slate-500">No rooms yet.</div>}
        <ul className="py-2 space-y-1">
          {rooms.map(r => (
            <li key={r.id}>
              <button onClick={() => { onSelectRoom(r.id) }} className={clsx('group w-full text-left px-4 py-3 flex flex-col gap-1 border-l-2 transition-all duration-200', activeRoom === r.id ? 'bg-slate-800/70 border-indigo-400 shadow-inner shadow-indigo-900/30' : 'border-transparent hover:bg-slate-800/40')}>
                <span className="font-medium text-sm truncate group-hover:text-indigo-300/90">{r.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div
        className={clsx('absolute top-0 right-0 h-full w-1 cursor-ew-resize bg-transparent hover:bg-indigo-500/30', !open && 'pointer-events-none')}
        onMouseDown={onResizeMouseDown}
        title="Drag to resize"
        aria-label="Drag to resize sidebar"
      />
    </aside>
    </>
  );
}