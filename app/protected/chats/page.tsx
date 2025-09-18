"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { CreateRoomModal } from '@/components/chat/CreateRoomModal';

export default function ChatsIndex() {
  const { data: session } = useSession();
  const [rooms, setRooms] = useState<{ id: string; name: string }[]>([]);
  const [roomsLoading, setRoomsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState<{ id: string; email: string }[]>([]);
  const [roomName, setRoomName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setRoomsLoading(true); setError(null);
      try {
        const r = await fetch('/api/chat/rooms');
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Failed to load rooms');
        if (!cancelled) setRooms(Array.isArray(d.rooms) ? d.rooms : []);
      } catch (e: any) {
        if (!cancelled) setError(e.message || 'Failed to load rooms');
      } finally {
        if (!cancelled) setRoomsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

useEffect(() => { if (showModal) { fetch('/api/chats/users').then(r=>r.json()).then(d=> setUsers(Array.isArray(d.users) ? d.users : [])); } }, [showModal]);

  const toggleMember = (id: string) => {
    setSelectedMembers(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const createRoom = async () => {
    if (!roomName.trim()) return;
    setError(null);
    try {
      const res = await fetch('/api/chat/rooms', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: roomName.trim(), memberIds: Array.from(selectedMembers) })
      });
      const data = await res.json();
      if (!res.ok || !data.room) throw new Error(data.error || 'Failed to create room');
      setRooms(r => [data.room, ...r]);
      setShowModal(false); setRoomName(''); setSelectedMembers(new Set());
    } catch (e: any) { setError(e.message || 'Failed to create'); }
  };

  return (
    <div className="relative min-h-screen w-screen overflow-y-auto bg-[linear-gradient(135deg,#0b1220,45%,#0e1628)] text-slate-100">
      <header className="sticky top-0 z-10 h-16 border-b border-slate-800/70 bg-slate-900/60 backdrop-blur-xl">
        <div className="h-full w-full pl-14 pr-3 sm:pl-16 sm:pr-5 flex items-center justify-between">
          <h1 className="text-sm font-semibold tracking-wide uppercase text-slate-200">Chats</h1>
          <button onClick={() => setShowModal(true)} className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-xs font-medium shadow">Create chat</button>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6">
        {error && <div className="mb-4 text-rose-300 text-xs">{error}</div>}
        {roomsLoading ? (
          <div className="text-sm text-slate-300">Loading chats…</div>
        ) : (
          <>
            {!rooms.length && (
              <div className="text-xs text-slate-400 mb-4">No rooms yet. Create one to get started.</div>
            )}
            <ul className="overflow-hidden rounded-xl border border-slate-800/70 bg-slate-900/40 divide-y divide-slate-800/60">
              {rooms.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/protected/chats/${r.id}`}
                    className="block w-full px-4 py-4 hover:bg-slate-800/50 transition flex items-center justify-between gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/60"
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-slate-200 truncate">{r.name}</div>
                    </div>
                    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-slate-300"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>

      <CreateRoomModal
        open={showModal}
        onClose={() => setShowModal(false)}
        roomName={roomName}
        setRoomName={setRoomName}
        users={users as any}
        currentUserId={session?.user?.id as any}
        selectedMembers={selectedMembers}
        toggleMember={toggleMember}
        onCreate={createRoom}
      />
    </div>
  );
}