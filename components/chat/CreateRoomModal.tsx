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

interface CreateRoomModalProps {
  open: boolean;
  onClose: () => void;
  roomName: string;
  setRoomName: (v: string) => void;
  currentUserId?: string | null;
  onCreate: (memberIds: string[]) => void | Promise<void>;
}

export function CreateRoomModal({ open, onClose, roomName, setRoomName, currentUserId, onCreate }: CreateRoomModalProps) {
  const [schools, setSchools] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [schoolId, setSchoolId] = useState('');
  const [role, setRole] = useState<RoleKey | ''>('');
  const [candidateMap, setCandidateMap] = useState<Record<string, User>>({});
  const [fetchingCandidates, setFetchingCandidates] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        setLoadingSchools(true);
        const r = await fetch('/api/schools');
        const d = await r.json();
        const list = Array.isArray(d.data) ? d.data : d;
        const mapped = (list || []).map((s: any) => ({ id: s.id, name: s.name }));
        setSchools(mapped);
      } catch (e: any) { setError(e.message); } finally { setLoadingSchools(false); }
    })();
  }, [open]);

  useEffect(() => {
    setCandidateMap({});
    setSelectedIds([]);
  }, [schoolId]);

  const disabledCreate = !roomName.trim();

  async function loadCandidates() {
    if (!schoolId || !role) return;
    try {
      setFetchingCandidates(true); setError(null);
      const r = await fetch(`/api/chat/users?schoolId=${encodeURIComponent(schoolId)}&role=${role}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Failed to fetch users');
      const list: User[] = d.users || [];
      const filtered = list.filter(u => u.id !== currentUserId);
      setCandidateMap(prev => {
        const next = { ...prev };
        for (const user of filtered) {
          next[user.id] = user;
        }
        return next;
      });
    } catch (e: any) { setError(e.message); } finally { setFetchingCandidates(false); }
  }

  const candidates = useMemo(() => Object.values(candidateMap), [candidateMap]);

  const candidateOptions: Option[] = useMemo(() => candidates.map(c => {
    const label = ([c.first_name, c.last_name].filter(Boolean).join(' ').trim() || c.email || c.id) + (c.email ? ` (${c.email})` : '');
    return { value: c.id, label };
  }), [candidates]);

  function handleCreate() { if (disabledCreate) return; onCreate(selectedIds); }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl popover-surface p-6 space-y-6">
        <div className="flex items-start justify-between">
          <h3 className="text-sm font-semibold tracking-wide uppercase opacity-80 text-black">Create Room</h3>
          <button onClick={onClose} className="text-xs px-3 py-1 rounded menu-icon-btn hover:menu-icon-btn-active">Close</button>
        </div>
        {error && <div className="text-red-600 text-xs font-medium">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5 md:col-span-1">
            <label className="text-[11px] uppercase tracking-wider opacity-70">Room Name</label>
            <input value={roomName} onChange={e=> setRoomName(e.target.value)} placeholder="Team Sync" className="w-full rounded-md menu-icon-btn px-3 py-2 text-sm focus:outline-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-wider opacity-70">School</label>
            <select value={schoolId} onChange={e=> setSchoolId(e.target.value)} className="w-full rounded-md menu-icon-btn px-2 py-2 text-sm focus:outline-none">
              <option value="" disabled>{loadingSchools ? 'Loading…' : 'Select school'}</option>
              {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] uppercase tracking-wider opacity-70">Role</label>
            <select value={role} onChange={e=> setRole(e.target.value as RoleKey)} disabled={!schoolId} className="w-full rounded-md menu-icon-btn px-2 py-2 text-sm focus:outline-none disabled:opacity-50">
              <option value="" disabled>Select role</option>
              {(Object.keys(ROLE_LABELS) as RoleKey[]).map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button disabled={!schoolId || !role || fetchingCandidates} onClick={loadCandidates} className="w-full px-3 py-2 rounded menu-icon-btn hover:menu-icon-btn-active disabled:opacity-50 text-sm">{fetchingCandidates ? 'Loading…' : 'Load Users'}</button>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[11px] uppercase tracking-wider opacity-70">
            <span>Candidates {candidateOptions.length ? `(${candidateOptions.length})` : ''}</span>
            {candidateOptions.length > 0 && <button onClick={() => setSelectedIds(candidateOptions.map(o => String(o.value)))} className="text-[11px] underline">Select All</button>}
          </div>
          <SearchableSelect
            multiple
            options={candidateOptions}
            value={selectedIds}
            onChange={vals => setSelectedIds(Array.isArray(vals) ? (vals as string[]) : [])}
            placeholder={fetchingCandidates ? 'Loading users…' : (schoolId && role ? 'Search users...' : 'Select school & role first')}
            disabled={!schoolId || !role || fetchingCandidates}
            virtualizeThreshold={100}
          />
          {(!fetchingCandidates && candidateOptions.length === 0) && (
            <div className="text-[11px] opacity-60">{schoolId && role ? 'No users found for this selection' : 'Select school & role then load users'}</div>
          )}
          <div className="flex items-center justify-between pt-1">
            <div className="text-[11px] opacity-70">{selectedIds.length} selected</div>
            <div className="flex gap-2">
              {selectedIds.length > 0 && <button onClick={()=> setSelectedIds([])} className="px-3 py-2 rounded menu-icon-btn text-xs">Clear</button>}
              <button onClick={handleCreate} disabled={disabledCreate} className="text-xs px-5 py-2 rounded-md menu-icon-btn hover:menu-icon-btn-active disabled:opacity-30 disabled:cursor-not-allowed">Create</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}