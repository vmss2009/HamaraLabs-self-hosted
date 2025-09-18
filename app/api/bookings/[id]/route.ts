import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const booking = await prisma.booking.findUnique({ where: { id }, select: { id: true, userId: true, date: true, startTime: true, endTime: true } });
    if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (booking.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const schedule = await prisma.schedule.findFirst({
      where: { userId: booking.userId, date: booking.date },
      include: { timeSlots: { where: { startTime: booking.startTime, endTime: booking.endTime } } },
    });

    const deleteBooking = prisma.booking.delete({ where: { id: booking.id } });

    if (schedule && schedule.timeSlots.length > 0) {
      const timeSlot = schedule.timeSlots[0];
      const updateTimeSlot = prisma.timeSlot.update({ where: { id: timeSlot.id }, data: { bookedSlots: { decrement: 1 } } });
      await prisma.$transaction([deleteBooking, updateTimeSlot]);
    } else {
      await deleteBooking;
    }

    return NextResponse.json({ success: true, restoredSlot: `${booking.startTime}-${booking.endTime}` });
  } catch (error) {
    console.error("Delete booking failed", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}