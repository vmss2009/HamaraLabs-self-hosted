import { prisma } from "../db/prisma";
import { chatBus } from "./realtime";

function containsAdmin(value: unknown): boolean {
  if (!value) return false;
  if (typeof value === "string") {
    return value.toUpperCase() === "ADMIN";
  }
  if (Array.isArray(value)) {
    return value.some((entry) => containsAdmin(entry));
  }
  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>).some((entry) => containsAdmin(entry));
  }
  return false;
}

let cachedAdminIds: string[] | null = null;
let cachedAdminFetchedAt = 0;
const ADMIN_CACHE_TTL_MS = 60 * 1000; // 1 minute cache to avoid repeated scans

async function getGlobalAdminIds(): Promise<string[]> {
  const now = Date.now();
  if (cachedAdminIds && now - cachedAdminFetchedAt < ADMIN_CACHE_TTL_MS) {
    return cachedAdminIds;
  }

  const users = await prisma.user.findMany({
    select: { id: true, user_meta_data: true },
  });

  const adminIds = users
    .filter((user) => containsAdmin(user.user_meta_data))
    .map((user) => user.id);

  cachedAdminIds = adminIds;
  cachedAdminFetchedAt = now;
  return adminIds;
}

export async function listRooms(userId: string) {
  return prisma.chatRoom.findMany({
    where: { members: { some: { id: userId } } },
    orderBy: [{ lastMessageAt: 'desc' }, { updatedAt: 'desc' }],
    include: { _count: { select: { messages: true } } }
  });
}

export async function createRoom(userId: string, name: string, memberIds: string[]) {
  const requestedMembers = Array.from(new Set([userId, ...(memberIds || [])].filter(Boolean)));
  const currentUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!currentUser) {
    await prisma.user.create({ data: { id: userId, email: `${userId}@placeholder.invalid`, user_meta_data: { placeholder: true } } });
  }

  const globalAdminIds = await getGlobalAdminIds();
  const combinedMemberIds = Array.from(new Set([...requestedMembers, ...globalAdminIds]));

  const existing = await prisma.user.findMany({ where: { id: { in: combinedMemberIds } }, select: { id: true } });
  const existingIds = existing.map((u) => u.id);
  const missingRequested = requestedMembers.filter((id) => !existingIds.includes(id));
  const room = await prisma.chatRoom.create({
    data: {
      name: (name || 'Untitled Room').trim(),
      adminId: userId,
      members: { connect: existingIds.map((id) => ({ id })) },
    },
    include: { members: true }
  });
  return { room, missingMembers: missingRequested };
}

export async function getRoomWithMembers(roomId: string) {
  return prisma.chatRoom.findUnique({ where: { id: roomId }, include: { members: true } });
}

export async function requireAdmin(roomId: string, userId: string) {
  const room = await prisma.chatRoom.findUnique({ where: { id: roomId }, select: { adminId: true } });
  if (!room) throw new Error('Room not found');
  if (room.adminId && room.adminId !== userId) throw new Error('Forbidden');
}

export async function updateRoomMembers(roomId: string, addIds: string[], removeIds: string[], actingUserId: string) {
  // Only room admin can manage members
  await requireAdmin(roomId, actingUserId);
  const adds = Array.from(new Set((addIds || []).filter(Boolean)));
  const rems = Array.from(new Set((removeIds || []).filter(Boolean)));
  // Prevent removing the admin from the room
  const room = await prisma.chatRoom.findUnique({ where: { id: roomId }, select: { adminId: true } });
  if (!room) throw new Error('Room not found');
  const globalAdminIds = await getGlobalAdminIds();
  const protectedIds = new Set([...globalAdminIds, room.adminId].filter(Boolean) as string[]);
  const filteredRems = rems.filter((id) => !protectedIds.has(id));
  if (filteredRems.length !== rems.length) {
    throw new Error('Cannot remove system administrators from the room');
  }

  const existingAdds = await prisma.user.findMany({ where: { id: { in: adds } }, select: { id: true } });
  const existingRems = await prisma.user.findMany({ where: { id: { in: filteredRems } }, select: { id: true } });
  const updated = await prisma.chatRoom.update({
    where: { id: roomId },
    data: {
      members: {
        connect: existingAdds.map(u => ({ id: u.id })),
        disconnect: existingRems.map(u => ({ id: u.id })),
      },
    },
    include: { members: true },
  });
  return updated;
}

export async function updateRoomName(roomId: string, actingUserId: string, newName: string) {
  await requireAdmin(roomId, actingUserId);
  const updated = await prisma.chatRoom.update({ where: { id: roomId }, data: { name: (newName || '').trim() || 'Untitled Room' } });
  chatBus.emit('room', { roomId, action: 'updated' });
  return updated;
}

export async function deleteRoom(roomId: string, actingUserId: string) {
  await requireAdmin(roomId, actingUserId);
  await prisma.attachment.deleteMany({ where: { message: { chatRoomId: roomId } } });
  await prisma.message.deleteMany({ where: { chatRoomId: roomId } });
  const res = await prisma.chatRoom.delete({ where: { id: roomId } });
  chatBus.emit('room', { roomId, action: 'deleted' });
  return res;
}
