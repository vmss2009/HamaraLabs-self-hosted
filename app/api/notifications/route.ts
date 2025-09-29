import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationsRead,
  markNotificationsUnread,
  deleteNotifications,
} from "@/lib/db/notification/crud";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const takeParam = searchParams.get("take");
  const cursor = searchParams.get("cursor");
  const unreadOnly = searchParams.get("unread") === "true";

  const take = takeParam ? Number.parseInt(takeParam, 10) : undefined;

  try {
    const result = await listNotifications(session.user.id, {
      take: Number.isFinite(take as number) ? (take as number) : undefined,
      cursor: cursor || undefined,
      unreadOnly,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error listing notifications", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: any = {};
  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  try {
    const action = typeof body.action === "string" ? body.action : "read";
    if (!["read", "unread", "delete"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    if (body.markAll === true) {
      if (action !== "read") {
        return NextResponse.json({ error: "markAll is only supported for read action" }, { status: 400 });
      }
      const result = await markAllNotificationsRead(session.user.id);
      return NextResponse.json(result);
    }

    const ids = Array.isArray(body.ids) ? body.ids.filter((id: unknown) => typeof id === "string") : [];
    if (!ids.length) {
      return NextResponse.json({ error: "No notification ids provided" }, { status: 400 });
    }

    if (action === "unread") {
      const result = await markNotificationsUnread(session.user.id, ids);
      return NextResponse.json(result);
    }

    if (action === "delete") {
      const result = await deleteNotifications(session.user.id, ids);
      return NextResponse.json(result);
    }

    const result = await markNotificationsRead(session.user.id, ids);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating notifications", error);
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 });
  }
}
