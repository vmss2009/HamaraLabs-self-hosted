import { prisma } from "../db/prisma";

export async function listRooms(userId: string) {
  return prisma.chatRoom.findMany({
    where: { members: { some: { id: userId } } },
    orderBy: [{ lastMessageAt: 'desc' }, { updatedAt: 'desc' }],
    include: { _count: { select: { messages: true } } }
  });
}

export async function createRoom(userId: string, name: string, memberIds: string[]) {
  const unique = Array.from(new Set([userId, ...(memberIds || [])].filter(Boolean)));
  const currentUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!currentUser) {
    await prisma.user.create({ data: { id: userId, email: `${userId}@placeholder.invalid`, user_meta_data: { placeholder: true } } });
  }
  const existing = await prisma.user.findMany({ where: { id: { in: unique } }, select: { id: true } });
  const existingIds = existing.map(u => u.id);
  const missing = unique.filter(id => !existingIds.includes(id));
  const room = await prisma.chatRoom.create({
    data: {
      name: (name || 'Untitled Room').trim(),
      adminId: userId,
      members: { connect: existingIds.map(id => ({ id })) }
    },
    include: { members: true }
  });
  return { room, missingMembers: missing };
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
  const filteredRems = rems.filter(id => id !== room.adminId);

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
  return prisma.chatRoom.update({ where: { id: roomId }, data: { name: (newName || '').trim() || 'Untitled Room' } });
}

export async function deleteRoom(roomId: string, actingUserId: string) {
  await requireAdmin(roomId, actingUserId);
  await prisma.attachment.deleteMany({ where: { message: { chatRoomId: roomId } } });
  await prisma.message.deleteMany({ where: { chatRoomId: roomId } });
  return prisma.chatRoom.delete({ where: { id: roomId } });
}
