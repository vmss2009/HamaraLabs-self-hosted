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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl popover-surface p-6 space-y-5">
        <h3 className="text-sm font-semibold tracking-wide uppercase opacity-80 text-black">Create Room</h3>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-wider opacity-70">Room Name</label>
            <input value={roomName} onChange={e=> setRoomName(e.target.value)} placeholder="Team Sync" className="w-full rounded-md menu-icon-btn px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--background)_60%,var(--foreground)_40%)]" />
          </div>
          <div className="space-y-1.5 max-h-44 overflow-y-auto custom-scroll pr-1">
            <label className="text-[11px] uppercase tracking-wider opacity-70">Members</label>
            {users.filter(u=> u.id !== currentUserId).map(u=> {
              const active = selectedMembers.has(u.id);
              return (
                <button key={u.id} type="button" onClick={()=> toggleMember(u.id)} className={clsx('w-full flex items-center justify-between rounded-md px-3 py-2 text-xs border transition shadow-sm menu-icon-btn', active && 'menu-icon-btn-active')}>{u.email}<span className="opacity-70">{active ? 'Added' : 'Add'}</span></button>
              );
            })}
            {!users.length && <div className="text-[11px] opacity-60">Loading users...</div>}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button onClick={onClose} className="text-xs px-4 py-2 rounded-md menu-icon-btn hover:menu-icon-btn-active">Cancel</button>
          <button onClick={onCreate} disabled={!roomName.trim()} className="text-xs px-5 py-2 rounded-md menu-icon-btn hover:menu-icon-btn-active disabled:opacity-30 disabled:cursor-not-allowed">Create</button>
        </div>
      </div>
    </div>
  );
}