import React from 'react';

export interface User { id: string; email?: string; first_name?: string | null; last_name?: string | null; }

export function ManageMembersModal({
  open,
  onClose,
  roomMembers,
  users,
  addQuery,
  setAddQuery,
  onAdd,
  onRemove,
  currentUserId,
  canManage,
  adminId,
}: {
  open: boolean;
  onClose: () => void;
  roomMembers: User[];
  users: User[];
  addQuery: string;
  setAddQuery: (v: string) => void;
  onAdd: (userId: string) => void;
  onRemove: (userId: string) => void;
  currentUserId?: string | null;
  canManage?: boolean;
  adminId?: string | null;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-900/90 border border-slate-700/70 p-6 space-y-5 shadow-2xl shadow-black/60">
        <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-300">Members</h3>

        <div className="space-y-2">
          <div className="text-[11px] uppercase tracking-wider text-slate-400">Current Members</div>
          <div className="space-y-1.5 max-h-44 overflow-y-auto custom-scroll pr-1">
            {roomMembers.map(m => {
              const name = [m.first_name, m.last_name].filter(Boolean).join(' ').trim() || m.first_name || m.last_name || m.email || m.id;
              return (
                <div key={m.id} className="w-full flex items-center justify-between rounded-md px-3 py-2 text-xs border border-slate-700/70 bg-slate-800/50">
                  <div className="min-w-0 mr-2">
                    <div className="truncate font-medium text-slate-200">{name}</div>
                    {m.email && <div className="truncate text-[11px] text-slate-400">{m.email}</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    {adminId && m.id === adminId && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-600/80 text-[10px] uppercase tracking-wide">Admin</span>
                    )}
                    {canManage && (!adminId || m.id !== adminId) ? (
                      <button className="px-2 py-1 rounded bg-rose-700/80 hover:bg-rose-600 text-white"
                        onClick={() => onRemove(m.id)}
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
            {!roomMembers.length && <div className="text-[11px] text-slate-500">No members</div>}
          </div>
        </div>

        {canManage && (
          <div className="space-y-2">
            <div className="text-[11px] uppercase tracking-wider text-slate-400">Add New Member</div>
            <input value={addQuery} onChange={(e)=> setAddQuery(e.target.value)} placeholder="Search users…" className="w-full rounded bg-slate-800/70 border border-slate-700/70 px-2 py-1 text-sm focus:outline-none focus:ring-0" />
            <div className="space-y-1.5 max-h-44 overflow-y-auto custom-scroll pr-1">
            {users
              .filter(u => u.id !== currentUserId)
              .filter(u => !roomMembers.some(m => m.id === u.id))
              .filter(u => {
                const q = addQuery.trim().toLowerCase();
                if (!q) return true;
                const name = [u.first_name, u.last_name].filter(Boolean).join(' ').toLowerCase();
                const email = (u.email || '').toLowerCase();
                const id = (u.id || '').toLowerCase();
                return name.includes(q) || email.includes(q) || id.includes(q);
              })
              .map(u => {
                const name = [u.first_name, u.last_name].filter(Boolean).join(' ').trim() || u.first_name || u.last_name || u.email || u.id;
                return (
                  <div key={u.id} className="w-full flex items-center justify-between rounded-md px-3 py-2 text-xs border border-slate-700/70 bg-slate-800/50">
                    <div className="min-w-0 mr-2">
                      <div className="truncate font-medium text-slate-200">{name}</div>
                      {u.email && <div className="truncate text-[11px] text-slate-400">{u.email}</div>}
                    </div>
                    <button className="px-2 py-1 rounded bg-emerald-700/80 hover:bg-emerald-600 text-white"
                      onClick={() => onAdd(u.id)}
                    >
                      Add
                    </button>
                  </div>
                );
              })
              }
              {!users.length && <div className="text-[11px] text-slate-500">Loading users...</div>}
            </div>
          </div>
          )}

        <div className="flex justify-end pt-1">
          <button onClick={onClose} className="text-xs px-4 py-2 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700/70">Close</button>
        </div>
      </div>
    </div>
  );
}
