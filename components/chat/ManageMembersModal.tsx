import React from 'react';

export interface User { id: string; email: string; }

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
        <h3 className="text-sm font-semibold tracking-wide uppercase text-slate-300">Manage Members</h3>

        <div className="space-y-2">
          <div className="text-[11px] uppercase tracking-wider text-slate-400">Current Members</div>
          <div className="space-y-1.5 max-h-44 overflow-y-auto custom-scroll pr-1">
            {roomMembers.map(m => (
              <div key={m.id} className="w-full flex items-center justify-between rounded-md px-3 py-2 text-xs border border-slate-700/70 bg-slate-800/50">
                <span className="truncate mr-2 flex items-center gap-2">
                  {m.email || m.id}
                  {adminId && m.id === adminId && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-600/80 text-[10px] uppercase tracking-wide">Admin</span>
                  )}
                </span>
                {canManage && (!adminId || m.id !== adminId) ? (
                  <button className="px-2 py-1 rounded bg-rose-700/80 hover:bg-rose-600 text-white"
                    onClick={() => onRemove(m.id)}
                  >
                    Remove
                  </button>
                ) : (
                  <span className="text-slate-500 text-[10px]">{m.id === adminId ? 'Owner' : ''}</span>
                )}
              </div>
            ))}
            {!roomMembers.length && <div className="text-[11px] text-slate-500">No members</div>}
          </div>
        </div>

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
                const t = (u.email || u.id).toLowerCase();
                return t.includes(q);
              })
              .map(u => (
                <div key={u.id} className="w-full flex items-center justify-between rounded-md px-3 py-2 text-xs border border-slate-700/70 bg-slate-800/50">
                  <span className="truncate mr-2">{u.email || u.id}</span>
                  {canManage ? (
                    <button className="px-2 py-1 rounded bg-emerald-700/80 hover:bg-emerald-600 text-white"
                      onClick={() => onAdd(u.id)}
                    >
                      Add
                    </button>
                  ) : (
                    <span className="text-slate-500 text-[10px]">No permission</span>
                  )}
                </div>
              ))}
            {!users.length && <div className="text-[11px] text-slate-500">Loading users...</div>}
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button onClick={onClose} className="text-xs px-4 py-2 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700/70">Close</button>
        </div>
      </div>
    </div>
  );
}
