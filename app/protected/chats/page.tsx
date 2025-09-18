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
  const [roomName, setRoomName] = useState('');

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

  const createRoom = async (memberIds: string[]) => {
    if (!roomName.trim()) return;
    setError(null);
    try {
      const res = await fetch('/api/chat/rooms', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: roomName.trim(), memberIds })
      });
      const data = await res.json();
      if (!res.ok || !data.room) throw new Error(data.error || 'Failed to create room');
      setRooms(r => [data.room, ...r]);
      setShowModal(false); setRoomName('');
    } catch (e: any) { setError(e.message || 'Failed to create'); }
  };

  return (
    <div className="relative min-h-screen w-full overflow-y-auto" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      <header className="sticky top-0 z-10 h-14 border-b" style={{ background: 'var(--surface-2)', borderColor: 'var(--border-subtle)' }}>
        <div className="h-full w-full pl-14 pr-3 sm:pl-16 sm:pr-5 flex items-center justify-between">
          <h1 className="text-sm font-semibold tracking-wide uppercase">Chats</h1>
          <button
            onClick={() => setShowModal(true)}
            className="px-3 py-1.5 rounded text-xs font-medium border transition-colors"
            style={{ background: 'color-mix(in srgb, var(--foreground) 6%, transparent)', borderColor: 'color-mix(in srgb, var(--foreground) 18%, transparent)' }}
          >
            Create chat
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6">
        {error && <div className="mb-4 text-xs rounded-md border px-3 py-2" style={{ background: 'color-mix(in srgb, var(--foreground) 8%, transparent)', borderColor: 'color-mix(in srgb, var(--foreground) 18%, transparent)' }}>{error}</div>}
        {roomsLoading ? (
          <div className="text-sm opacity-70">Loading chats…</div>
        ) : (
          <>
            {!rooms.length && (
              <div className="text-xs opacity-60 mb-4">No rooms yet. Create one to get started.</div>
            )}
            <ul
              className="overflow-hidden rounded-xl border divide-y"
              style={{ background: 'var(--surface-1)', borderColor: 'var(--border-subtle)', '--tw-divide-opacity': '1' } as any}
            >
              {rooms.map((r) => (
                <li key={r.id} className="group">
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/protected/chats/${r.id}`}
                      className="block flex-1 px-4 py-4 transition flex items-center justify-between gap-3 focus:outline-none focus-visible:ring-2 rounded-none"
                      style={{ borderColor: 'var(--border-subtle)' }}
                    >
                      <div className="min-w-0">
                        <div className="font-medium truncate" style={{ color: 'var(--foreground)' }}>{r.name}</div>
                      </div>
                      <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 opacity-70"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </Link>
                  </div>
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
        currentUserId={session?.user?.id as any}
        onCreate={createRoom}
      />
    </div>
  );
}