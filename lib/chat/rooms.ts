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
      members: { connect: existingIds.map(id => ({ id })) }
    },
    include: { members: true }
  });
  return { room, missingMembers: missing };
}

export async function getRoomWithMembers(roomId: string) {
  return prisma.chatRoom.findUnique({ where: { id: roomId }, include: { members: true } });
}

export async function updateRoomMembers(roomId: string, addIds: string[], removeIds: string[]) {
  const adds = Array.from(new Set((addIds || []).filter(Boolean)));
  const rems = Array.from(new Set((removeIds || []).filter(Boolean)));
  const existingAdds = await prisma.user.findMany({ where: { id: { in: adds } }, select: { id: true } });
  const existingRems = await prisma.user.findMany({ where: { id: { in: rems } }, select: { id: true } });
  const room = await prisma.chatRoom.update({
    where: { id: roomId },
    data: {
      members: {
        connect: existingAdds.map(u => ({ id: u.id })),
        disconnect: existingRems.map(u => ({ id: u.id })),
      },
    },
    include: { members: true },
  });
  return room;
}