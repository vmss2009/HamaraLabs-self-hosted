import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";
type ExternalNotifyPayload = Pick<NotificationCreateInput, "userId" | "title" | "description">;

async function sendExternalNotificationAlerts(notifications: ExternalNotifyPayload[]) {
    const token = process.env.NOTIFY_TOKEN;
    if (!token || !notifications.length) return;

  if (typeof fetch !== "function") {
    console.error("Global fetch API is not available in this runtime; skipping external notification alerts.");
    return;
  }

    const buildMessageBody = (notification: ExternalNotifyPayload) => {
        if (notification.description) {
            return notification.description.replace(/<[^>]*>/g, "").trim() || notification.title;
        }
        return notification.title;
    };
    
  // Fetch user priorities for all users in this batch
  const userIds = Array.from(new Set(notifications.map(n => n.userId)));
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, priority: true }
  });
  
  const userPriorityMap = new Map(users.map(u => [u.id, u.priority ?? 3]));
    
  await Promise.allSettled(
    notifications.map(async (notification) => {
        const message = buildMessageBody(notification) ?? "";
        const url = `https://hamaralabs-notify.hamaralabs.com/alerts-${notification.userId}`;
        const priority = userPriorityMap.get(notification.userId) ?? 3;
        try {
        fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Basic ${token}`,
            Title: notification.title,
            Priority: String(priority),
            Sound: "siren",
            "Content-Type": "text/plain",
          },
          body: message,
        });
      } catch (error) {
        console.error("Failed to send notify alert", { url, error });
      }
    }),
  );
}

export type NotificationCreateInput = {
  userId: string;
  title: string;
  description?: string | null;
  category?: string;
  resourceType?: string | null;
  resourceId?: string | null;
  data?: Prisma.JsonValue;
};

export type ListNotificationsOptions = {
  take?: number;
  cursor?: string | null;
  unreadOnly?: boolean;
};

export async function createNotifications(inputs: NotificationCreateInput[]): Promise<void> {
  if (!inputs.length) return;

  // Deduplicate within the same batch by userId + resourceType + resourceId + category + title
  const keyFor = (n: NotificationCreateInput) =>
    `${n.userId}::${n.resourceType ?? ""}::${n.resourceId ?? ""}::${n.category ?? ""}::${n.title}`;

  const uniqueMap = new Map<string, NotificationCreateInput>();
  for (const n of inputs) {
    const key = keyFor(n);
    if (!uniqueMap.has(key)) uniqueMap.set(key, n);
  }
  const uniqueInputs = Array.from(uniqueMap.values());

  // Avoid creating notifications that were created very recently with the same key
  // (helps prevent duplicates when two helpers trigger notifications almost simultaneously).
  const cutoff = new Date(Date.now() - 10_000); // 10 seconds
  const userIds = Array.from(new Set(uniqueInputs.map((i) => i.userId)));

  const recentNotifications = userIds.length
    ? await prisma.notification.findMany({
        where: {
          userId: { in: userIds },
          createdAt: { gte: cutoff },
        },
        select: { userId: true, resourceType: true, resourceId: true, category: true, title: true },
      })
    : [];

  const recentKeySet = new Set<string>(
    recentNotifications.map((r) => `${r.userId}::${r.resourceType ?? ""}::${r.resourceId ?? ""}::${r.category ?? ""}::${r.title}`),
  );

  const toCreate = uniqueInputs.filter((i) => !recentKeySet.has(keyFor(i)));
  if (!toCreate.length) return;

  await prisma.notification.createMany({
    data: toCreate.map((n) => {
      const row: Prisma.NotificationCreateManyInput = {
        userId: n.userId,
        title: n.title,
        description: n.description ?? null,
        category: n.category ?? "general",
        resourceType: n.resourceType ?? null,
        resourceId: n.resourceId ?? null,
      };
      if (typeof n.data !== "undefined") {
        row.data = n.data === null ? Prisma.DbNull : n.data;
      }
      return row;
    }),
  });

  await sendExternalNotificationAlerts(
    toCreate.map(({ userId, title, description }) => ({ userId, title, description })),
  );
}

export async function listNotifications(userId: string, options?: ListNotificationsOptions) {
  const take = Math.max(1, Math.min(50, options?.take ?? 20));
  const notifications = await prisma.notification.findMany({
    where: {
      userId,
      readAt: options?.unreadOnly ? null : undefined,
    },
    orderBy: { createdAt: "desc" },
    take,
    skip: options?.cursor ? 1 : 0,
    cursor: options?.cursor ? { id: options.cursor } : undefined,
  });
  const nextCursor = notifications.length === take ? notifications[notifications.length - 1].id : null;
  return { notifications, nextCursor };
}

export async function markNotificationsRead(userId: string, ids: string[]) {
  if (!ids.length) return { count: 0 };
  const result = await prisma.notification.updateMany({
    where: {
      userId,
      id: { in: ids },
      readAt: null,
    },
    data: { readAt: new Date() },
  });
  return { count: result.count };
}

export async function markAllNotificationsRead(userId: string) {
  const result = await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
  return { count: result.count };
}

export async function markNotificationsUnread(userId: string, ids: string[]) {
  if (!ids.length) return { count: 0 };
  const result = await prisma.notification.updateMany({
    where: {
      userId,
      id: { in: ids },
    },
    data: { readAt: null },
  });
  return { count: result.count };
}

export async function deleteNotifications(userId: string, ids: string[]) {
  if (!ids.length) return { count: 0 };
  const result = await prisma.notification.deleteMany({
    where: {
      userId,
      id: { in: ids },
    },
  });
  return { count: result.count };
}
