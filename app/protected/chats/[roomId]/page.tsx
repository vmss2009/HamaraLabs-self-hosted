"use client";
import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import clsx from 'clsx';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Mathematics from '@tiptap/extension-mathematics';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { Color, TextStyle } from '@tiptap/extension-text-style'
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import { useParams, useRouter } from 'next/navigation';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { DragOverlay } from '@/components/chat/DragOverlay';
import { CreateRoomModal } from '@/components/chat/CreateRoomModal';
import { ManageMembersModal } from '@/components/chat/ManageMembersModal';
import { IconSpinner, IconX, IconResizeNS, IconPlus, IconMinus } from '../../../../components/chat/Icons';
import { MessageBody } from '../../../../components/chat/MessageBody';
import { AttachmentPreview, SelectedAttachmentPreview } from '../../../../components/chat/AttachmentPreview';
import { MenuBar } from '../../../../components/chat/MenuBar';

interface Room { id: string; name: string; _count?: { messages: number }; }
interface Message { id: string; content?: string; createdAt: string; sender: any; attachments?: any[]; type: string; pending?: boolean; }
interface User { id: string; email?: string; first_name?: string | null; last_name?: string | null; }

export default function ChatRoomPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const params = useParams<{ roomId: string }>();
  const activeRoom = (params?.roomId as string) || null;
  const [rooms, setRooms] = useState<Room[]>([]);
  const [composerHeight, setComposerHeight] = useState<number>(56);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [olderLoading, setOlderLoading] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [editorEmpty, setEditorEmpty] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [roomMembers, setRoomMembers] = useState<User[]>([]);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [activeRoomName, setActiveRoomName] = useState<string>('');
  const [roomAdminId, setRoomAdminId] = useState<string>('');
  const [manageOpen, setManageOpen] = useState(false);
  const [addQuery, setAddQuery] = useState('');
  const [roomName, setRoomName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(false);
  const [olderIOEnabled, setOlderIOEnabled] = useState(false);
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const composerRef = useRef<HTMLDivElement | null>(null);
  const esRef = useRef<EventSource | null>(null);
  const dropRef = useRef<HTMLDivElement | null>(null);
  const meId = useMemo(() => session?.user?.id ?? null, [session?.user?.id]);
  const dragCounterRef = useRef(0);
  const topSentinelRef = useRef<HTMLDivElement | null>(null);
  const olderObserverRef = useRef<IntersectionObserver | null>(null);
  const olderInFlightRef = useRef(false);
  const leftTopSinceLastLoadRef = useRef(false);
  const initialScrolledRef = useRef(false);
  const [recordError, setRecordError] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color.configure({ types: ['textStyle'] }),
      Highlight.configure({ multicolor: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Mathematics.configure({
        inlineOptions: {
          onClick: (node: any, pos: number) => {
            const latex = (node?.attrs?.latex ?? '').toString();
            window.dispatchEvent(new CustomEvent('tiptap:open-math-popover', { detail: { latex, mode: 'inline', fromPos: pos, toPos: pos + node.nodeSize } }));
          },
        },
        blockOptions: {
          onClick: (node: any, pos: number) => {
            const latex = (node?.attrs?.latex ?? '').toString();
            window.dispatchEvent(new CustomEvent('tiptap:open-math-popover', { detail: { latex, mode: 'block', fromPos: pos, toPos: pos + node.nodeSize } }));
          },
        },
      }),
    ],
    content: '',
    immediatelyRender: false,
  });

  const editorHasContent = useCallback(() => {
    try {
      if (!editor) return false;
      const json: any = editor.getJSON();
      let found = false;
      const walk = (node: any) => {
        if (!node || found) return;
        if (node.type === 'inlineMath' || node.type === 'blockMath') { found = true; return; }
        if (node.type === 'text' && typeof node.text === 'string' && node.text.trim().length > 0) { found = true; return; }
        if (Array.isArray(node.content)) node.content.forEach(walk);
      };
      walk(json);
      return found;
    } catch { return false; }
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    const updateEmpty = () => { setEditorEmpty(!editorHasContent()); };
    updateEmpty();
    editor.on('update', updateEmpty);
    editor.on('selectionUpdate', updateEmpty);
    return () => {
      editor.off('update', updateEmpty);
      editor.off('selectionUpdate', updateEmpty);
    };
  }, [editor, editorHasContent]);

  const loadOlder = useCallback(async () => {
    if (!activeRoom || !nextCursor || olderInFlightRef.current) return;
    olderInFlightRef.current = true;
    setOlderLoading(true);
    const el = listRef.current;
    const prevHeight = el?.scrollHeight ?? 0;
    const prevTop = el?.scrollTop ?? 0;
    try {
      const r = await fetch(`/api/chat/messages?roomId=${encodeURIComponent(activeRoom)}&cursor=${encodeURIComponent(nextCursor)}&take=20`);
      const d = await r.json();
      if (Array.isArray(d.messages)) {
        setMessages(curr => {
          const byId = new Map<string, any>(curr.map(m => [m.id, m]));
          for (const m of d.messages) byId.set(m.id, m);
          const arr = Array.from(byId.values());
          arr.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          return arr;
        });
        setNextCursor(d.nextCursor || null);
        if (el) {
          setTimeout(() => {
            const newHeight = el.scrollHeight;
            el.scrollTop = newHeight - prevHeight + prevTop;
          }, 0);
        }
      }
    } catch { /* ignore */ }
    finally {
      setOlderLoading(false);
      olderInFlightRef.current = false;
    }
  }, [activeRoom, nextCursor]);

  useEffect(() => {
    if (!olderIOEnabled) return;
    const root = listRef.current;
    const target = topSentinelRef.current;
    if (!root || !target) return;
    const io = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry && entry.isIntersecting) {
        io.disconnect();
        olderObserverRef.current = null;
        setOlderIOEnabled(false);
        leftTopSinceLastLoadRef.current = false;
        loadOlder();
      }
    }, { root, rootMargin: '0px', threshold: 0.1 });
    olderObserverRef.current = io;
    io.observe(target);
    return () => { io.disconnect(); olderObserverRef.current = null; };
  }, [olderIOEnabled, loadOlder]);

  useEffect(() => {
    const load = async () => {
      setRoomsLoading(true); setError(null);
      try {
        const r = await fetch('/api/chat/rooms');
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Failed to load rooms');
        const list: any[] = Array.isArray(d.rooms) ? d.rooms.filter(Boolean) : [];
        setRooms(list as Room[]);
      } catch (e: any) { setError(e.message); }
      finally { setRoomsLoading(false); }
    };
    load();
  }, []);

useEffect(() => { if (showModal) { fetch('/api/chat/users').then(r=>r.json()).then(d=> setUsers(Array.isArray(d.users)? d.users: [])); } }, [showModal]);
  useEffect(() => { if (manageOpen) { fetch('/api/chat/users').then(r=>r.json()).then(d=> setUsers(Array.isArray(d.users)? d.users: [])); } }, [manageOpen]);

  useEffect(() => {
    if (!activeRoom) { setMessages([]); setRoomMembers([]); setNextCursor(null); setHasAccess(null); return; }
    if (!meId) { setHasAccess(null); return; }
    setMessagesLoading(true); setError(null); setHasAccess(null);
    let cancelled = false;
    let es: EventSource | null = null;
    const load = async () => {
      try {
        const r2 = await fetch(`/api/chat/room?roomId=${encodeURIComponent(activeRoom)}`);
        const d2 = await r2.json().catch(() => ({}));
        if (!r2.ok || !d2?.room) {
          if (!cancelled) { setHasAccess(false); setRoomMembers([]); setActiveRoomName(''); setMessages([]); setNextCursor(null); }
          return;
        }
        const members: any[] = Array.isArray(d2.room?.members) ? d2.room.members : [];
        const allowed = members.some(m => m?.id === meId);
        if (!allowed) {
          if (!cancelled) { setHasAccess(false); setRoomMembers([]); setActiveRoomName(''); setMessages([]); setNextCursor(null); }
          return;
        }
        if (cancelled) return;
        setHasAccess(true);
        setRoomMembers(members as any);
        setActiveRoomName(d2.room?.name || '');
        setRoomAdminId(d2.room?.adminId || '');

        const r1 = await fetch(`/api/chat/messages?roomId=${encodeURIComponent(activeRoom)}&take=20`);
        const d1 = await r1.json().catch(() => ({}));
        if (!cancelled) {
          if (r1.ok && Array.isArray(d1.messages)) {
            setMessages(d1.messages);
            setNextCursor(d1.nextCursor || null);
          } else {
            setMessages([]); setNextCursor(null);
          }
        }

        if (cancelled) return;
        if (esRef.current) { esRef.current.close(); }
        es = new EventSource(`/api/chat/events?roomId=${encodeURIComponent(activeRoom)}`);
        esRef.current = es;
        es.addEventListener('message', async (ev: MessageEvent) => {
          try {
            const payload = (() => { try { return JSON.parse(ev?.data || '{}'); } catch { return {}; } })();
            const msgId = payload?.messageId as string | undefined;
            if (msgId) {
              const r = await fetch(`/api/chat/message?id=${encodeURIComponent(msgId)}`);
              if (r.ok) {
                const d = await r.json();
                const m = d?.message;
                if (m && m.chatRoomId === activeRoom) {
                  setMessages(curr => {
                    const byId = new Map<string, any>(curr.map(mm => [mm.id, mm]));
                    byId.set(m.id, m);
                    const arr = Array.from(byId.values());
                    arr.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                    return arr;
                  });
                }
              } else if (r.status === 404) {
                // Deleted message — remove if present
                setMessages(curr => curr.filter(mm => mm.id !== msgId));
              } else {
                // Fallback: refresh window
                const rr = await fetch(`/api/chat/messages?roomId=${encodeURIComponent(activeRoom)}&take=20`);
                const dd = await rr.json();
                if (Array.isArray(dd.messages)) {
                  setMessages(curr => {
                    const byId = new Map<string, any>(curr.map(mm => [mm.id, mm]));
                    for (const x of dd.messages) byId.set(x.id, x);
                    const arr = Array.from(byId.values());
                    arr.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                    return arr;
                  });
                }
              }
              const el = listRef.current;
              if (el) {
                const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
                if (nearBottom) setShouldAutoScroll(true);
              }
            } else {
              // No id in payload — refresh
              const rr = await fetch(`/api/chat/messages?roomId=${encodeURIComponent(activeRoom)}&take=20`);
              const dd = await rr.json();
              if (Array.isArray(dd.messages)) {
                setMessages(curr => {
                  const byId = new Map<string, any>(curr.map(mm => [mm.id, mm]));
                  for (const x of dd.messages) byId.set(x.id, x);
                  const arr = Array.from(byId.values());
                  arr.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                  return arr;
                });
              }
            }
          } catch { /* ignore */ }
        });
        es.onerror = () => { /* silent */ };
      } catch (e: any) {
        if (!cancelled) { setError(e.message || 'Failed to load room'); setHasAccess(false); }
      } finally {
        if (!cancelled) setMessagesLoading(false);
      }
    };
    load();
    return () => { cancelled = true; if (es) es.close(); };
  }, [activeRoom, meId]);

  useEffect(() => { initialScrolledRef.current = false; }, [activeRoom]);
  useEffect(() => { if (activeRoom) { setShouldAutoScroll(true); } }, [activeRoom]);
  useEffect(() => {
    if (!messagesLoading && messages.length > 0 && !initialScrolledRef.current) {
      requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'auto' });
        const el = listRef.current;
        if (el) el.scrollTop = el.scrollHeight;
      });
      initialScrolledRef.current = true;
    }
  }, [messagesLoading, messages, activeRoom]);

  useEffect(() => {
    if (shouldAutoScroll) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      setShouldAutoScroll(false);
    }
  }, [messages, shouldAutoScroll]);

  useEffect(() => {
    const root = listRef.current;
    if (!root) return;
    const THRESH = 80;
    const BOTTOM_THRESH = 200;
    const onScroll = () => {
      if (root.scrollTop > THRESH) {
        leftTopSinceLastLoadRef.current = true;
        if (olderObserverRef.current) {
          olderObserverRef.current.disconnect();
          olderObserverRef.current = null;
        }
        if (olderIOEnabled) setOlderIOEnabled(false);
      } else if (root.scrollTop <= THRESH && leftTopSinceLastLoadRef.current) {
        if (!olderObserverRef.current && nextCursor) {
          setOlderIOEnabled(true);
        }
      }
      const distFromBottom = root.scrollHeight - root.scrollTop - root.clientHeight;
      setShowJumpToLatest(distFromBottom > BOTTOM_THRESH);
    };
    root.addEventListener('scroll', onScroll, { passive: true });
    return () => root.removeEventListener('scroll', onScroll);
  }, [nextCursor, olderIOEnabled]);

  const addFiles = (files: FileList | File[]) => {
    const arr = Array.from(files);
    setSelectedFiles(prev => {
      const existing = new Map(prev.map(f => [f.name + ':' + f.size + ':' + f.lastModified, true]));
      const next: File[] = [...prev];
      for (const f of arr) {
        const k = f.name + ':' + f.size + ':' + f.lastModified;
        if (existing.has(k)) continue;
        if (next.length >= MAX_FILES) {
          setError(`Maximum ${MAX_FILES} files per message.`);
          break;
        }
        next.push(f);
        existing.set(k, true);
      }
      return next;
    });
  };
  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;
    const hasFiles = (e: DragEvent) => Array.from(e.dataTransfer?.types || []).includes('Files');

    const onDragEnter = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      dragCounterRef.current += 1;
      setIsDraggingFiles(true);
    };
    const onDragOver = (e: DragEvent) => { if (hasFiles(e)) e.preventDefault(); };
    const onDragLeave = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      dragCounterRef.current = Math.max(0, dragCounterRef.current - 1);
      if (dragCounterRef.current === 0) setIsDraggingFiles(false);
    };
    const onDrop = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      setIsDraggingFiles(false);
      dragCounterRef.current = 0;
      const files = e.dataTransfer?.files;
      if (files && files.length) addFiles(files);
    };

    el.addEventListener('dragenter', onDragEnter as any);
    el.addEventListener('dragover', onDragOver as any);
    el.addEventListener('dragleave', onDragLeave as any);
    el.addEventListener('drop', onDrop as any);
    return () => {
      el.removeEventListener('dragenter', onDragEnter as any);
      el.removeEventListener('dragover', onDragOver as any);
      el.removeEventListener('dragleave', onDragLeave as any);
      el.removeEventListener('drop', onDrop as any);
    };
  }, []);

  const toggleMember = (id: string) => { setSelectedMembers(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }); };

  const createRoom = async () => {
    if(!roomName.trim()) return;
    setError(null);
    try {
      const res = await fetch('/api/chat/rooms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: roomName.trim(), memberIds: Array.from(selectedMembers) }) });
      const data = await res.json();
      if(!res.ok || !data.room) throw new Error(data.error || 'Failed to create room');
      setRooms(r => [data.room, ...r]);
      setShowModal(false); setRoomName(''); setSelectedMembers(new Set());
      router.push(`/protected/chats/${data.room.id}`);
      if (data.missingMembers?.length) {
        setError(`Skipped ${data.missingMembers.length} unknown member(s).`);
      }
    } catch (e: any) { setError(e.message); }
  };

  const MAX_FILES = 5;
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingStreamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);
  const [viewerSrc, setViewerSrc] = useState<string | null>(null);
  const [viewerZoom, setViewerZoom] = useState<number>(1);
  const [viewerType, setViewerType] = useState<'image' | 'video'>('image');

  const startRecording = async () => {
    setRecordError(null);
    try {
      if (isRecording) return;
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        setRecordError('Audio recording is not supported in this browser.');
        return;
      }
      const support = (() => {
        const candidates = [
          { mime: 'audio/webm;codecs=opus', ext: 'webm' },
          { mime: 'audio/webm', ext: 'webm' },
          { mime: 'audio/ogg;codecs=opus', ext: 'ogg' },
          { mime: 'audio/mp4', ext: 'm4a' },
          { mime: 'audio/mpeg', ext: 'mp3' },
        ];
        for (const c of candidates) {
          // @ts-ignore
          if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported?.(c.mime)) return c;
        }
        return null;
      })();
      if (!support) { setRecordError('No supported audio recording format found in this browser.'); return; }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordingStreamRef.current = stream;
      const mr = new MediaRecorder(stream, { mimeType: support.mime } as any);
      recordedChunksRef.current = [];
      mr.ondataavailable = (e: BlobEvent) => { if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data); };
      mr.onstop = async () => {
        try {
          const blob = new Blob(recordedChunksRef.current, { type: support.mime });
          const now = new Date();
          const ts = now.toISOString().replaceAll(':', '-');
          const file = new File([blob], `recording-${ts}.${support.ext}`, { type: support.mime, lastModified: Date.now() });
          addFiles([file] as any);
        } catch (e:any) {
          setRecordError(e.message || 'Failed to capture recording');
        } finally {
          try { recordingStreamRef.current?.getTracks().forEach(t => t.stop()); } catch {}
          recordingStreamRef.current = null;
          mediaRecorderRef.current = null;
          setIsRecording(false);
        }
      };
      mediaRecorderRef.current = mr;
      mr.start();
      setIsRecording(true);
    } catch (e:any) {
      setRecordError(e.message || 'Failed to start recording');
      try { recordingStreamRef.current?.getTracks().forEach(t => t.stop()); } catch {}
      recordingStreamRef.current = null;
      mediaRecorderRef.current = null;
      setIsRecording(false);
    }
  };

  const stopRecording = () => { try { mediaRecorderRef.current?.stop(); } catch {} };

  const uploadSelectedFiles = async (): Promise<{ url: string; type: string; filename: string; size: number }[]> => {
    if (!activeRoom || selectedFiles.length === 0) return [];
    setIsUploading(true);
    try {
      const results: { url: string; type: string; filename: string; size: number }[] = [];
      for (const file of selectedFiles) {
        const fd = new FormData();
        fd.append('roomId', activeRoom);
        fd.append('file', file);
        const res = await fetch('/api/storage/upload', { method: 'POST', body: fd });
        const data = await res.json();
        if (!res.ok || !data.url) throw new Error(data.error || 'Upload failed');
        results.push({ url: data.url, type: file.type || 'application/octet-stream', filename: file.name, size: file.size });
      }
      return results;
    } finally { setIsUploading(false); }
  };

  const canSend = !isUploading && !isRecording && (editorHasContent() || selectedFiles.length > 0);

  const send = async () => {
    if(!editor || !activeRoom) return;
    if(!canSend) return;

    const html = editorHasContent() ? editor.getHTML() : '';

    try {
      const attachments = await uploadSelectedFiles();
      const optimistic: Message = {
        id: 'temp-' + Date.now(),
        content: html || undefined,
        createdAt: new Date().toISOString(),
        sender: { email: session?.user?.email },
        type: attachments.length && !html ? 'FILE' : 'TEXT',
        pending: true,
        attachments,
      } as any;
      setMessages(m => [...m, optimistic]);

      if (html) editor.commands.clearContent();
      setSelectedFiles([]);
      setShouldAutoScroll(true);

      const r = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId: activeRoom, content: html || undefined, attachments: attachments.length ? attachments : undefined }),
      });
      const resp = await r.json().catch(() => ({}));
      if(!r.ok) throw new Error(resp?.error || 'Send failed');

      if (resp?.message) {
        setMessages(curr => curr.map(m => m.id === optimistic.id ? resp.message : m));
      } else {
        const rr = await fetch(`/api/chat/messages?roomId=${encodeURIComponent(activeRoom)}`);
        const dd = await rr.json();
        if (Array.isArray(dd.messages)) setMessages(dd.messages);
      }
    } catch (e:any) {
      setError(e.message || 'Failed to send');
    }
  };

  const withinWindow = (createdAt: string) => (Date.now() - new Date(createdAt).getTime()) <= 10 * 60 * 1000;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const getDateKey = (iso: string) => {
    const d = new Date(iso);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
    };
  const formatDateLabel = (iso: string) => {
    const d = new Date(iso);
    const today = new Date();
    const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate());
    const a = startOf(today).getTime();
    const b = startOf(d).getTime();
    const diffDays = Math.round((a - b) / (24 * 60 * 60 * 1000));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const dd = String(d.getDate()).padStart(2, '0');
    const mon = months[d.getMonth()];
    const yyyy = d.getFullYear();
    return `${dd} ${mon}, ${yyyy}`;
  };

const removeFileAt = (idx: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const startEdit = (m: Message) => {
    setEditingId(m.id);
    setEditValue(m.content || '');
    try {
      editor?.commands.setContent(m.content || '');
      setTimeout(() => editor?.commands.focus('end'), 0);
      composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    } catch {}
  };
  const cancelEdit = () => { setEditingId(null); setEditValue(''); try { editor?.commands.clearContent(); } catch {} };
  const saveEdit = async () => {
    if (!editingId || !editor) return;
    try {
      const newHtml = editor.getHTML();
      const r = await fetch('/api/chat/message', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editingId, content: newHtml })});
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Failed to edit');
      setEditingId(null); setEditValue('');
      editor.commands.clearContent();
      const rr = await fetch(`/api/chat/messages?roomId=${encodeURIComponent(activeRoom!)}`);
      const dd = await rr.json();
      if (Array.isArray(dd.messages)) setMessages(dd.messages);
    } catch (e:any) { setError(e.message); }
  };
  const removeMessage = async (id: string) => {
    try {
      const r = await fetch(`/api/chat/message?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Failed to delete');
      const rr = await fetch(`/api/chat/messages?roomId=${encodeURIComponent(activeRoom!)}`);
      const dd = await rr.json();
      if (Array.isArray(dd.messages)) setMessages(dd.messages);
    } catch (e:any) { setError(e.message); }
  };

  const [isDraggingFiles, setIsDraggingFiles] = useState(false);

  return (
    <div
      ref={dropRef}
      className="relative flex h-screen w-full overflow-hidden"
      style={{ background: 'var(--background)', color: 'var(--foreground)' }}
    >
      <DragOverlay show={isDraggingFiles} remaining={MAX_FILES - selectedFiles.length} />
      <section className="flex-1 flex flex-col h-full min-w-0">
        {hasAccess === null && (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <IconSpinner className="h-4 w-4 animate-spin" /> Loading chat…
            </div>
          </div>
        )}
        {hasAccess === false && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-slate-400 text-sm">Chat does not exist</div>
          </div>
        )}
        {hasAccess === true && (
          <>
            <ChatHeader
              roomName={activeRoomName || String(activeRoom || '')}
              membersCount={roomMembers.length}
              loading={messagesLoading}
              canManage={!!session?.user?.id && roomAdminId === (session?.user?.id as any)}
              onManage={() => setManageOpen(true)}
              onBack={() => router.push('/protected/chats')}
              onRename={async () => {
                try {
                  const curr = activeRoomName || '';
                  const name = window.prompt('Rename chat', curr);
                  if (!name || name.trim() === curr.trim()) return;
                  const r = await fetch('/api/chat/room', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ roomId: activeRoom, name }) });
                  const d = await r.json();
                  if (!r.ok) throw new Error(d.error || 'Failed to rename');
                  setActiveRoomName(d?.room?.name || name);
                } catch (e: any) { setError(e.message || 'Rename failed'); }
              }}
              onDelete={async () => {
                try {
                  if (!window.confirm('Delete this chat? This cannot be undone.')) return;
                  const r = await fetch(`/api/chat/room?roomId=${encodeURIComponent(activeRoom!)}`, { method: 'DELETE' });
                  const d = await r.json().catch(() => ({}));
                  if (!r.ok) throw new Error(d.error || 'Failed to delete');
                  router.push('/protected/chats');
                } catch (e: any) { setError(e.message || 'Delete failed'); }
              }}
            />
              <div ref={listRef} className="relative flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 space-y-3 md:space-y-4 custom-scroll" onClick={()=> setOpenMenuId(null)}>
              {olderLoading && (
                <div className="absolute top-2 left-0 right-0 z-20 flex items-center justify-center pointer-events-none">
                  <div className="flex items-center gap-2 px-2 py-1 rounded bg-slate-800/90 border border-slate-700/70 text-[11px]">
                    <IconSpinner className="h-3.5 w-3.5" /> Loading older…
                  </div>
                </div>
              )}
              <div ref={topSentinelRef} className="h-1" />
              {(() => {
                let lastDateKey: string | null = null;
                return messages.map((m, idx) => {
                  const mine = m.sender?.id ? (m.sender.id === meId) : (m.sender?.email && m.sender.email === session?.user?.email);
                  const isAdmin = !!session?.user?.id && roomAdminId === (session?.user?.id as any);
                  const showEdit = mine && withinWindow(m.createdAt);
                  const showDelete = (mine && withinWindow(m.createdAt)) || isAdmin;
                  const menuOpen = openMenuId === m.id;
                  const thisKey = getDateKey(m.createdAt);
                  const showDivider = thisKey !== lastDateKey;
                  if (showDivider) lastDateKey = thisKey;
                  return (
                    <div key={m.id + '-' + idx} className="w-full">
                      {showDivider && (
                        <div className="w-full py-2 flex items-center justify-center">
                          <div className="px-3 py-1 rounded-full text-[11px] font-medium bg-slate-800/80 border border-slate-700/70 text-slate-300 shadow/20 shadow-black/30">
                            {formatDateLabel(m.createdAt)}
                          </div>
                        </div>
                      )}
                      <div className={clsx('flex w-full overflow-visible', mine ? 'justify-end' : 'justify-start')}>
                    <div
                      className={clsx(
                        'group relative max-w-[82%] md:max-w-[68%] rounded-2xl px-4 py-2 text-sm shadow/20 shadow-black/40 flex flex-col gap-2 ring-1 ring-transparent transition-all z-0',
                        menuOpen ? 'z-50' : 'z-0',
                        mine ? 'bg-gradient-to-br from-indigo-600/90 to-indigo-500/80 text-white backdrop-blur ring-indigo-400/0 group-hover:ring-indigo-300/40' : 'bg-slate-800/70 backdrop-blur ring-slate-700/80 group-hover:ring-slate-500/50'
                      )}
                      title={new Date(m.createdAt).toLocaleString()}
                    >
                      <div className={clsx('text-[11px] font-semibold leading-none', mine ? 'text-indigo-100/90' : 'text-emerald-300')}>
                        {(m as any)?.sender?.first_name?.trim?.() || (m as any)?.sender?.email || 'Unknown'}
                      </div>
                      {m.attachments?.length ? (
                        <div className="relative">
                          <div className="grid grid-cols-2 gap-2">
                            {m.attachments.map(a => (
                              <AttachmentPreview
                                key={a.id || a.url}
                                a={a}
                                onImageClick={(src: string) => { setViewerSrc(src); setViewerZoom(1); setViewerType('image'); }}
                                onVideoClick={(src: string) => { setViewerSrc(src); setViewerZoom(1); setViewerType('video'); }}
                              />
                            ))}
                          </div>
                          {m.pending && (
                            <div className="absolute inset-0 rounded-md bg-black/40 grid place-items-center">
                              <IconSpinner className="h-6 w-6 text-white" />
                            </div>
                          )}
                        </div>
                      ) : null}
                      {m.content && <MessageBody html={m.content} />}
                      <div
                        className={clsx(
                          "flex gap-1 items-center mt-0.5 leading-none",
                          mine ? "justify-end" : "justify-start"
                        )}
                      >
                        {m.pending && (
                          <span className="text-[10px] text-yellow-200/90">sending…</span>
                        )}

                        {mine ? (
                          <div
                            className={clsx(
                              "flex items-center gap-1 text-[10px] tracking-wide uppercase opacity-0 group-hover:opacity-100 transition",
                              mine ? "text-indigo-100/80" : "text-slate-400/80"
                            )}
                          >
                            <span>
                              {new Date(m.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>

                            {(showEdit || showDelete) && (
                              <div className="relative">
                                <button
                                  className={clsx(
                                    "px-1 py-0.5 rounded text-[10px] border transition",
                                    mine
                                      ? "bg-indigo-500/60 hover:bg-indigo-500/80 border-indigo-400/40 text-white"
                                      : "bg-slate-700/60 hover:bg-slate-700/80 border-slate-600/60 text-slate-100"
                                  )}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(menuOpen ? null : m.id);
                                  }}
                                  aria-haspopup="menu"
                                  aria-expanded={menuOpen}
                                  title="Message actions"
                                >
                                  •••
                                </button>
                                {menuOpen && (
                                  <div
                                    className={clsx(
                                      "absolute mt-1 min-w-[120px] max-w-[90vw] rounded-md bg-slate-900/95 border border-slate-700/70 shadow-lg shadow-black/40 z-50",
                                      mine ? "right-0" : "left-0"
                                    )}
                                  >
                                    <ul className="py-1 text-[12px]">
                                      {showEdit && (
                                        <li>
                                          <button
                                            className="w-full text-left px-3 py-1.5 hover:bg-slate-800"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setOpenMenuId(null);
                                              startEdit(m);
                                            }}
                                          >
                                            Edit
                                          </button>
                                        </li>
                                      )}
                                      {showDelete && (
                                        <li>
                                          <button
                                            className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-rose-300 hover:text-rose-200"
                                            onClick={async (e) => {
                                              e.stopPropagation();
                                              setOpenMenuId(null);
                                              await removeMessage(m.id);
                                            }}
                                          >
                                            Delete
                                          </button>
                                        </li>
                                      )}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div
                            className={clsx(
                              "flex items-center gap-1 text-[10px] tracking-wide uppercase opacity-0 group-hover:opacity-100 transition",
                              mine ? "text-indigo-100/80" : "text-slate-400/80"
                            )}
                          >
                            {(showEdit || showDelete) && (
                              <div className="relative">
                                <button
                                  className={clsx(
                                    "px-1 py-0.5 rounded text-[10px] border transition",
                                    mine
                                      ? "bg-indigo-500/60 hover:bg-indigo-500/80 border-indigo-400/40 text-white"
                                      : "bg-slate-700/60 hover:bg-slate-700/80 border-slate-600/60 text-slate-100"
                                  )}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(menuOpen ? null : m.id);
                                  }}
                                  aria-haspopup="menu"
                                  aria-expanded={menuOpen}
                                  title="Message actions"
                                >
                                  •••
                                </button>
                                {menuOpen && (
                                  <div
                                    className={clsx(
                                      "absolute mt-1 min-w-[120px] max-w-[90vw] rounded-md bg-slate-900/95 border border-slate-700/70 shadow-lg shadow-black/40 z-50",
                                      mine ? "right-0" : "left-0"
                                    )}
                                  >
                                    <ul className="py-1 text-[12px]">
                                      {showEdit && (
                                        <li>
                                          <button
                                            className="w-full text-left px-3 py-1.5 hover:bg-slate-800"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setOpenMenuId(null);
                                              startEdit(m);
                                            }}
                                          >
                                            Edit
                                          </button>
                                        </li>
                                      )}
                                      {showDelete && (
                                        <li>
                                          <button
                                            className="w-full text-left px-3 py-1.5 hover:bg-slate-800 text-rose-300 hover:text-rose-200"
                                            onClick={async (e) => {
                                              e.stopPropagation();
                                              setOpenMenuId(null);
                                              await removeMessage(m.id);
                                            }}
                                          >
                                            Delete
                                          </button>
                                        </li>
                                      )}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}
                            <span>
                              {new Date(m.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                      </div>
                    </div>
                  );
                });
              })()}
              {!messagesLoading && !messages.length && <div className="text-xs text-slate-500">No messages yet. Start the conversation.</div>}
              <div ref={bottomRef} />
            </div>
            <footer
              className="p-4 border-t flex flex-col gap-3 relative"
              style={{ background: 'var(--surface-2)', borderColor: 'var(--border-subtle)' }}
            >
              {(error || recordError) && <div className="text-[11px] text-rose-300 bg-rose-950/40 border border-rose-800/50 px-3 py-1 rounded">{error || recordError}</div>}
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={(e) => {
                    if (e.currentTarget.files) addFiles(e.currentTarget.files);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="hidden"
                />
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <div className="flex flex-col flex-1 min-w-0 gap-2">
                    <div
                      ref={composerRef}
                      className="rounded-lg px-3 py-2 shadow-inner"
                      style={{ background: 'var(--surface-1)', border: '1px solid var(--border-subtle)' }}
                    >
                      <div className="relative">
                        {editor && (
                          <MenuBar
                            editor={editor}
                            onAttach={() => fileInputRef.current?.click()}
                            isUploading={isUploading}
                            onToggleRecording={() => (isRecording ? stopRecording() : startRecording())}
                            isRecording={isRecording}
                            attachmentsCount={selectedFiles.length}
                            maxFiles={MAX_FILES}
                            showJumpToLatest={showJumpToLatest}
                            onJumpToLatest={() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); setShowJumpToLatest(false); }}
                            onSend={send}
                            canSend={canSend}
                            showSend={true}
                            isEditing={!!editingId}
                            canSaveEdit={!editorEmpty}
                            onSaveEdit={saveEdit}
                            onCancelEdit={cancelEdit}
                          />
                        )}
                      </div>
                      <div
                        className="relative rounded-xl cursor-text"
                        style={{
                          height: composerHeight,
                          background: 'var(--background)',
                          border: '1px solid color-mix(in srgb, var(--foreground) 18%, transparent)'
                        }}
                        onMouseDown={(e) => {
                          if (e.target === e.currentTarget) {
                            e.preventDefault();
                            try { editor?.commands.focus('end'); } catch {}
                          }
                        }}
                      >
                        <EditorContent
                          editor={editor}
                          className="tiptap resizable-editor h-full px-3 py-2 focus:outline-none focus:ring-0"
                        />
                        <button
                          type="button"
                          title="Resize editor"
                          aria-label="Resize editor"
                          onPointerDown={(e) => {
                            e.preventDefault();
                            const startY = e.clientY;
                            const startH = composerHeight;
                            const pid = e.pointerId;
                            try { (e.currentTarget as any).setPointerCapture?.(pid); } catch {}
                            const onMove = (ev: PointerEvent) => {
                              const delta = ev.clientY - startY;
                              const nh = Math.max(56, Math.min(startH - delta, Math.floor(window.innerHeight * 0.6)));
                              setComposerHeight(nh);
                            };
                            const onUp = () => {
                              document.removeEventListener('pointermove', onMove);
                              document.removeEventListener('pointerup', onUp);
                              document.removeEventListener('pointercancel', onUp);
                              try { (e.currentTarget as any).releasePointerCapture?.(pid); } catch {}
                            };
                            document.addEventListener('pointermove', onMove, { passive: true } as any);
                            document.addEventListener('pointerup', onUp);
                            document.addEventListener('pointercancel', onUp);
                          }}
                          className="absolute top-1 right-1 w-5 h-5 grid place-items-center rounded-md cursor-ns-resize touch-none select-none border"
                          style={{ background: 'color-mix(in srgb, var(--foreground) 10%, transparent)', borderColor: 'color-mix(in srgb, var(--foreground) 25%, transparent)' }}
                        >
                          <IconResizeNS className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {selectedFiles.length > 0 && (
                        <div className="mt-2 relative">
                          <div className="flex flex-wrap gap-2">
                            {selectedFiles.map((f, i) => (
                              <SelectedAttachmentPreview key={i} file={f} onRemove={() => removeFileAt(i)} />
                            ))}
                          </div>
                          {isUploading && (
                            <div className="absolute inset-0 rounded-md bg-black/50 grid place-items-center">
                              <IconSpinner className="h-8 w-8 text-white" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </footer>
          </>
        )}
      </section>

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

      {viewerSrc && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col">
          <div className="flex items-center justify-between p-3 text-slate-200">
            <div className="flex items-center gap-2">
              <button
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700/70 text-xs"
                onClick={() => setViewerZoom(z => Math.min(5, z + 0.25))}
                aria-label="Zoom in"
                title="Zoom in"
              >
                <IconPlus className="h-4 w-4" />
              </button>
              <button
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700/70 text-xs"
                onClick={() => setViewerZoom(z => Math.max(0.25, z - 0.25))}
                aria-label="Zoom out"
                title="Zoom out"
              >
                <IconMinus className="h-4 w-4" />
              </button>
              <button
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700/70 text-xs"
                onClick={() => setViewerZoom(1)}
                aria-label="Reset zoom"
                title="Reset zoom"
              >
                100%
              </button>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={viewerSrc || undefined}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700/70 text-xs"
                aria-label="Download media"
                title="Download media"
              >
                Download
              </a>
              <button
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700/70 text-xs"
                onClick={() => setViewerSrc(null)}
                aria-label="Close"
                title="Close"
              >
                <IconX className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <div className="min-h-full w-full flex items-center justify-center">
              {viewerType === 'image' ? (
                <img
                  src={viewerSrc}
                  alt="preview"
                  className="select-none"
                  style={{
                    transform: `scale(${viewerZoom})`,
                    transformOrigin: 'center center',
                    maxWidth: 'min(90vw, 1600px)',
                    maxHeight: 'min(85vh, 1200px)'
                  }}
                  draggable={false}
                />
              ) : (
                <video
                  controls
                  autoPlay
                  playsInline
                  style={{
                    transform: `scale(${viewerZoom})`,
                    transformOrigin: 'center center',
                    maxWidth: 'min(90vw, 1600px)',
                    maxHeight: 'min(85vh, 1200px)'
                  }}
                >
                  <source src={viewerSrc!} />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          </div>
        </div>
      )}

      <ManageMembersModal
        open={manageOpen}
        onClose={() => setManageOpen(false)}
        roomMembers={roomMembers as any}
        users={users as any}
        addQuery={addQuery}
        setAddQuery={setAddQuery}
        currentUserId={session?.user?.id as any}
        canManage={!!session?.user?.id && roomAdminId === (session?.user?.id as any)}
        adminId={roomAdminId}
        onAdd={async (userId: string) => {
          try {
            const r = await fetch('/api/chat/room', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ roomId: activeRoom, addIds: [userId], removeIds: [] })});
            const d = await r.json();
            if(!r.ok) throw new Error(d.error || 'Failed to add');
            setRoomMembers(Array.isArray(d.room?.members) ? d.room.members : []);
          } catch(e:any) { setError(e.message); }
        }}
        onRemove={async (userId: string) => {
          try {
            const r = await fetch('/api/chat/room', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ roomId: activeRoom, addIds: [], removeIds: [userId] })});
            const d = await r.json();
            if(!r.ok) throw new Error(d.error || 'Failed to remove');
            setRoomMembers(Array.isArray(d.room?.members) ? d.room.members : []);
          } catch(e:any) { setError(e.message); }
        }}
      />
    </div>
  );
}

