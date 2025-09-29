import React, { useEffect, useMemo, useState } from 'react';
import SearchableSelect, { Option } from '@/components/form/SearchableSelect';

export interface User { id: string; email?: string; first_name?: string | null; last_name?: string | null; }

type RoleKey = 'INCHARGE' | 'PRINCIPAL' | 'CORRESPONDENT' | 'MENTOR' | 'STUDENT';
const ROLE_LABELS: Record<RoleKey, string> = {
  INCHARGE: 'Incharge',
  PRINCIPAL: 'Principal',
  CORRESPONDENT: 'Correspondent',
  MENTOR: 'Mentor',
  STUDENT: 'Student',
};

interface ManageMembersModalProps {
  open: boolean;
  onClose: () => void;
  roomMembers: User[];
  users: User[]; // legacy: still passed but no longer directly listed for adding
  addQuery: string; // legacy search input state (unused now but kept for backwards compat)
  setAddQuery: (v: string) => void;
  onAdd: (userId: string) => Promise<void> | void;
  onRemove: (userId: string) => Promise<void> | void;
  currentUserId?: string | null;
  canManage?: boolean;
  adminId?: string | null;
}

export function ManageMembersModal(props: ManageMembersModalProps) {
  const { open, onClose, roomMembers, onAdd, onRemove, currentUserId, canManage, adminId } = props;
  const [schools, setSchools] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [schoolId, setSchoolId] = useState<string>('');
  const [role, setRole] = useState<RoleKey | ''>('');
  const [fetchingCandidates, setFetchingCandidates] = useState(false);
  const [candidateMap, setCandidateMap] = useState<Record<string, User>>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (!open) return;
    // fetch schools once when modal opens
    (async () => {
      try {
        setLoadingSchools(true);
        const r = await fetch('/api/schools');
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Failed to load schools');
        const list = Array.isArray(d.data) ? d.data : d; // success util wraps maybe {data:[]}
        const mapped = (list || []).map((s: any) => ({ id: s.id, name: s.name }));
        setSchools(mapped);
      } catch (e: any) { setError(e.message); }
      finally { setLoadingSchools(false); }
    })();
  }, [open]);

  // Reset downstream state when school changes
  useEffect(() => {
    setCandidateMap({});
    setSelectedIds([]);
  }, [schoolId]);

  const disabledAdd = !schoolId || !role || selectedIds.length === 0 || adding;

  async function loadCandidates() {
    if (!schoolId || !role) return;
    try {
      setFetchingCandidates(true);
      setError(null);
      const r = await fetch(`/api/chat/users?schoolId=${encodeURIComponent(schoolId)}&role=${role}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Failed to fetch users');
      const list: User[] = d.users || [];
      // filter out already members & self
      const filtered = list.filter(u => u.id !== currentUserId && !roomMembers.some(m => m.id === u.id));
      setCandidateMap(prev => {
        const next = { ...prev };
        for (const user of filtered) {
          next[user.id] = user;
        }
        return next;
      });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setFetchingCandidates(false);
    }
  }

  async function addSelectedBatch() {
    try {
      setAdding(true);
      for (const id of selectedIds) {
        await onAdd(id);
      }
      setSelectedIds([]);
    } catch (e: any) {
      setError(e.message || 'Failed to add members');
    } finally { setAdding(false); }
  }

  function toggle(id: string) {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  }

  const roleOptions = (Object.keys(ROLE_LABELS) as RoleKey[]).map(r => ({ value: r, label: ROLE_LABELS[r] }));

  const candidates = useMemo(() => {
    const memberIds = new Set(roomMembers.map(m => m.id));
    return Object.values(candidateMap).filter(c => !memberIds.has(c.id));
  }, [candidateMap, roomMembers]);

  // Build options for SearchableSelect from fetched candidates
  const candidateOptions: Option[] = useMemo(() => candidates.map(c => {
    const label = ([c.first_name, c.last_name].filter(Boolean).join(' ').trim() || c.email || c.id) + (c.email ? ` (${c.email})` : '');
    return { value: c.id, label };
  }), [candidates]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl popover-surface p-6 space-y-6">
        <div className="flex items-start justify-between">
          <h3 className="text-sm font-semibold tracking-wide uppercase opacity-80 text-black">Manage Members</h3>
          <button onClick={onClose} className="text-xs px-3 py-1 rounded menu-icon-btn hover:menu-icon-btn-active">Close</button>
        </div>

        {error && <div className="text-red-600 text-xs font-medium">{error}</div>}

        {/* Current Members */}
        <section className="space-y-2">
          <div className="text-[11px] uppercase tracking-wider opacity-70">Current Members</div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scroll pr-1">
            {roomMembers.map(m => {
              const name = [m.first_name, m.last_name].filter(Boolean).join(' ').trim() || m.email || m.id;
              return (
                <div key={m.id} className="w-full flex items-center justify-between rounded-md px-3 py-2 text-xs border menu-icon-btn">
                  <div className="min-w-0 mr-2">
                    <div className="truncate font-medium">{name}</div>
                    {m.email && <div className="truncate text-[11px] opacity-70">{m.email}</div>}
                  </div>
                  <div className="flex items-center gap-2">
                    {adminId && m.id === adminId && (
                      <span className="px-1.5 py-0.5 rounded menu-icon-btn-active text-[10px] uppercase tracking-wide">Admin</span>
                    )}
                    {canManage && (!adminId || m.id !== adminId) && (
                      <button
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{
                          background: 'color-mix(in srgb, var(--foreground) 10%, transparent)',
                          color: '#b00020',
                          border: '1px solid color-mix(in srgb, #b00020 60%, transparent)'
                        }}
                        onClick={() => onRemove(m.id)}
                        onMouseEnter={e => { e.currentTarget.style.background = '#b00020'; e.currentTarget.style.color = 'var(--background)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'color-mix(in srgb, var(--foreground) 10%, transparent)'; e.currentTarget.style.color = '#b00020'; }}
                        onMouseDown={e => { e.currentTarget.style.background = '#930018'; }}
                        onMouseUp={e => { e.currentTarget.style.background = '#b00020'; }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {!roomMembers.length && <div className="text-[11px] opacity-60">No members</div>}
          </div>
        </section>

        {canManage && (
          <section className="space-y-4">
            <div className="text-[11px] uppercase tracking-wider opacity-70">Add Members</div>
            {/* Selection controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1 col-span-1 sm:col-span-1">
                <label className="text-[11px] font-medium uppercase opacity-70">School</label>
                <select value={schoolId} onChange={e => setSchoolId(e.target.value)} className="w-full px-2 py-2 rounded border text-sm menu-icon-btn focus:outline-none">
                  <option value="" disabled>{loadingSchools ? 'Loading schools...' : 'Select school'}</option>
                  {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-1 col-span-1 sm:col-span-1">
                <label className="text-[11px] font-medium uppercase opacity-70">Role</label>
                <select value={role} onChange={e => setRole(e.target.value as RoleKey)} disabled={!schoolId} className="w-full px-2 py-2 rounded border text-sm menu-icon-btn focus:outline-none disabled:opacity-50">
                  <option value="" disabled>Select role</option>
                  {roleOptions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
              <div className="flex items-end">
                <button disabled={!schoolId || !role || fetchingCandidates} onClick={loadCandidates} className="w-full px-3 py-2 rounded menu-icon-btn hover:menu-icon-btn-active disabled:opacity-50 text-sm">
                  {fetchingCandidates ? 'Loading…' : 'Load Users'}
                </button>
              </div>
            </div>

            {/* Candidate selection via SearchableSelect */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-wider opacity-70">
                <span>Candidates {candidateOptions.length ? `(${candidateOptions.length})` : ''}</span>
                {candidateOptions.length > 0 && (
                  <button onClick={() => setSelectedIds(candidateOptions.map(o => String(o.value)))} className="text-[11px] underline">Select All</button>
                )}
              </div>
              <SearchableSelect
                multiple
                options={candidateOptions}
                value={selectedIds}
                onChange={(vals) => setSelectedIds(Array.isArray(vals) ? (vals as string[]) : [])}
                placeholder={fetchingCandidates ? 'Loading users…' : (schoolId && role ? 'Search users...' : 'Select school & role first')}
                disabled={!schoolId || !role || fetchingCandidates}
                virtualizeThreshold={100}
              />
              {(!fetchingCandidates && candidateOptions.length === 0) && (
                <div className="text-[11px] opacity-60">{schoolId && role ? 'No users found for selection' : 'Select school & role then load users'}</div>
              )}
              <div className="flex items-center justify-between pt-1">
                <div className="text-[11px] opacity-70">{selectedIds.length} selected</div>
                <div className="flex gap-2">
                  <button disabled={disabledAdd} onClick={addSelectedBatch} className="px-3 py-2 rounded menu-icon-btn hover:menu-icon-btn-active disabled:opacity-50 text-xs font-medium">
                    {adding ? 'Adding…' : 'Add Selected'}
                  </button>
                  {selectedIds.length > 0 && (
                    <button onClick={() => setSelectedIds([])} className="px-3 py-2 rounded menu-icon-btn text-xs">Clear</button>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
