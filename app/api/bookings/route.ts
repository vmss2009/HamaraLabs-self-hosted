import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { isBefore } from "date-fns";
import { createNotifications } from "@/lib/db/notification/crud";

function utcMidnightFromYMD(ymd: string) {
  const [y, m, d] = ymd.split("-").map((n) => parseInt(n, 10));
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const date = searchParams.get("date");

    if (!userId || !date) {
      return NextResponse.json({ message: "Missing userId or date" }, { status: 400 });
    }

    const dayStartUtc = utcMidnightFromYMD(date);
    const dayEndUtc = new Date(dayStartUtc.getTime() + 24 * 60 * 60 * 1000);

    const bookings = await prisma.booking.findMany({
      where: { userId, status: { not: "CANCELED" }, date: { gte: dayStartUtc, lt: dayEndUtc } },
      orderBy: [{ startTime: "asc" }, { createdAt: "asc" }],
      select: { id: true, startTime: true, endTime: true, guestName: true, guestEmail: true, notes: true, status: true, createdAt: true },
    });

    return NextResponse.json(bookings);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { email, date, startTime, endTime, guestName, guestEmail, notes, slotId } = await req.json();

    if (!email || !date || !startTime || !endTime || !guestName || !guestEmail) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    if (slotId) {
      const slot = await prisma.slot.findUnique({ where: { id: String(slotId) } });
      if (!slot) return NextResponse.json({ message: "Invalid slotId" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    const dayStartUtc = utcMidnightFromYMD(date);
    const dayEndUtc = new Date(dayStartUtc.getTime() + 24 * 60 * 60 * 1000);

    const todayUtcMidnight = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate(), 0, 0, 0, 0));
    if (isBefore(dayStartUtc, todayUtcMidnight)) {
      return NextResponse.json({ message: "Cannot book past dates" }, { status: 400 });
    }

    const schedule = await prisma.schedule.findFirst({
      where: { userId: user.id, date: { gte: dayStartUtc, lt: dayEndUtc } },
      include: { timeSlots: { where: { startTime, endTime } } },
    });

    if (!schedule || schedule.timeSlots.length === 0) {
      return NextResponse.json({ message: "Time slot not available" }, { status: 409 });
    }

    const timeSlot = schedule.timeSlots[0];

    if (timeSlot.bookedSlots >= timeSlot.maxSlots) {
      return NextResponse.json({ message: "Time slot fully booked" }, { status: 409 });
    }

    const existingBookings = await prisma.booking.count({
      where: { userId: user.id, date: { gte: dayStartUtc, lt: dayEndUtc }, startTime, endTime, status: { not: "CANCELED" } },
    });

    if (existingBookings >= timeSlot.maxSlots) {
      return NextResponse.json({ message: "Time slot fully booked" }, { status: 409 });
    }

    try {
      const [booking] = await prisma.$transaction([
        prisma.booking.create({
          data: { userId: user.id, date: schedule.date, startTime, endTime, guestName, guestEmail, notes, status: "CONFIRMED", ...(slotId ? { slotId: String(slotId) } : {}) },
        }),
        prisma.timeSlot.update({ where: { id: timeSlot.id }, data: { bookedSlots: { increment: 1 } } }),
      ]);

      // Send notification to calendar owner
      try {
        const formattedDate = new Date(schedule.date).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        });
        
        await createNotifications([{
          userId: user.id,
          title: "New Booking Scheduled",
          description: `${guestName} (${guestEmail}) has booked a session on ${formattedDate} from ${startTime} to ${endTime}.${notes ? ` Notes: ${notes}` : ''}`,
          category: "booking",
          resourceType: "booking",
          resourceId: booking.id,
          data: {
            bookingId: booking.id,
            guestName,
            guestEmail,
            date: schedule.date.toISOString(),
            startTime,
            endTime,
            notes,
          }
        }]);
      } catch (notifErr) {
        console.error("Failed to send booking notification:", notifErr);
        // Don't fail the booking if notification fails
      }

      try {
        const callOnBook = (user.user_meta_data as Record<string, unknown>)?.callOnBook === true;
        if (callOnBook) {
          await fetch("https://us-central1-hamaralabs-prod.cloudfunctions.net/phoneCall/call").catch(() => {});
        }
      } catch (extErr) {
        console.error("callOnBook external trigger failed", extErr);
      }

      return NextResponse.json({ booking }, { status: 201 });
    } catch (err) {
      console.error("Booking error:", err);
      return NextResponse.json({ message: "Failed to create booking" }, { status: 500 });
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}