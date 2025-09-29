import { prisma } from "../db/prisma";
import { chatBus } from './realtime';
import { notifyChatMessage } from "@/lib/notifications/service";

export async function listMessages(roomId: string, cursor?: string, takeParam?: number) {
  const take = Math.min(50, Math.max(1, Number.isFinite(takeParam as number) ? (takeParam as number) : 30));
  const rows = await prisma.message.findMany({
    where: { chatRoomId: roomId },
    orderBy: { createdAt: 'desc' },
    take,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    include: { attachments: true, sender: true }
  });
  const nextCursor = rows.length === take ? rows[rows.length - 1].id : null;
  const messages = rows.reverse();
  return { messages, nextCursor };
}

export async function sendMessage(roomId: string, senderId: string, data: { content?: string; attachments?: { url: string; type: string; filename?: string; size?: number }[]; type?: any }) {
  const message = await prisma.message.create({
    data: {
      chatRoomId: roomId,
      senderId,
      content: data.content,
      type: data.type || 'TEXT',
      attachments: data.attachments && data.attachments.length ? {
        create: data.attachments.map(a => ({ url: a.url, type: a.type, filename: a.filename, size: a.size }))
      } : undefined
    },
    include: { attachments: true, sender: true }
  });
  await prisma.chatRoom.update({ where: { id: roomId }, data: { lastMessageAt: new Date() } });
  chatBus.emit('message', { roomId, messageId: message.id });
  await notifyChatMessage(
    roomId,
    senderId,
    message.content,
    Array.isArray(data.attachments) ? data.attachments.length : message.attachments.length
  );
  return message;
}

export async function updateMessage(messageId: string, userId: string, content: string) {
  const msg = await prisma.message.findUnique({ where: { id: messageId } });
  if (!msg) throw new Error('Message not found');
  if (msg.senderId !== userId) throw new Error('Not authorized');
  const windowMs = 10 * 60 * 1000;
  if (Date.now() - new Date(msg.createdAt).getTime() > windowMs) throw new Error('Edit window expired');
  const updated = await prisma.message.update({ where: { id: messageId }, data: { content } });
  chatBus.emit('message', { roomId: msg.chatRoomId, messageId: messageId });
  return updated;
}

export async function deleteMessage(messageId: string, userId: string) {
  const msg = await prisma.message.findUnique({ where: { id: messageId }, include: { attachments: true } as any });
  if (!msg) throw new Error('Message not found');
  // Load room to check admin
  const room = await prisma.chatRoom.findUnique({ where: { id: msg.chatRoomId }, select: { adminId: true } });
  const isAdmin = room?.adminId === userId;
  if (!isAdmin) {
    if (msg.senderId !== userId) throw new Error('Not authorized');
    const windowMs = 10 * 60 * 1000;
    if (Date.now() - new Date(msg.createdAt).getTime() > windowMs) throw new Error('Delete window expired');
  }
  if ((msg as any).attachments?.length) {
    const ids = (msg as any).attachments.map((a: any) => a.id);
    await prisma.attachment.deleteMany({ where: { id: { in: ids } } });
  }
  await prisma.message.delete({ where: { id: messageId } });
  chatBus.emit('message', { roomId: msg.chatRoomId, messageId });
  return { ok: true };
}
