import React from 'react';
import clsx from 'clsx';

export interface User { id: string; email: string; }

export function CreateRoomModal({
  open,
  onClose,
  roomName,
  setRoomName,
  users,
  currentUserId,
  selectedMembers,
  toggleMember,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  roomName: string;
  setRoomName: (v: string) => void;
  users: User[];
  currentUserId?: string | null;
  selectedMembers: Set<string>;
  toggleMember: (id: string) => void;
  onCreate: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900/90 border border-slate-700/70 p-6 space-y-5 shadow-2xl shadow-black/60">
        <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-300">Create Room</h3>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-wider text-slate-400">Room Name</label>
            <input value={roomName} onChange={e=> setRoomName(e.target.value)} placeholder="Team Sync" className="w-full rounded-md bg-slate-800/70 border border-slate-700/70 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60" />
          </div>
          <div className="space-y-1.5 max-h-44 overflow-y-auto custom-scroll pr-1">
            <label className="text-[11px] uppercase tracking-wider text-slate-400">Members</label>
            {users.filter(u=> u.id !== currentUserId).map(u=> {
              const active = selectedMembers.has(u.id);
              return (
                <button key={u.id} type="button" onClick={()=> toggleMember(u.id)} className={clsx('w-full flex items-center justify-between rounded-md px-3 py-2 text-xs border transition shadow-sm', active ? 'bg-indigo-600/70 border-indigo-400 text-white shadow-indigo-900/40' : 'bg-slate-800/50 border-slate-700/70 hover:bg-slate-800/80')}>{u.email}<span className="opacity-70">{active ? 'Added' : 'Add'}</span></button>
              );
            })}
            {!users.length && <div className="text-[11px] text-slate-500">Loading users...</div>}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onClose} className="text-xs px-4 py-2 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700/70">Cancel</button>
          <button onClick={onCreate} disabled={!roomName.trim()} className="text-xs px-5 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:cursor-not-allowed shadow shadow-indigo-900/40">Create</button>
        </div>
      </div>
    </div>
  );
}