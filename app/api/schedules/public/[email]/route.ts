import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

const IST_OFFSET_MIN = 330; // +05:30
function startOfDayIST(date: Date): Date {
  const ist = new Date(date.getTime() + IST_OFFSET_MIN * 60000);
  const y = ist.getUTCFullYear();
  const m = ist.getUTCMonth();
  const d = ist.getUTCDate();
  return new Date(Date.UTC(y, m, d, 0, 0, 0) - IST_OFFSET_MIN * 60000);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ email: string }> }
) {
  try {
    const { email } = await params;
    const url = new URL(request.url);
    const leadMinutesParam = url.searchParams.get("leadMinutes");
    const leadMinutes = leadMinutesParam ? Math.max(0, parseInt(leadMinutesParam, 10) || 0) : 30;

    const now = new Date();
    const todayStart = startOfDayIST(now);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let schedules = await prisma.schedule.findMany({
      where: { userId: user.id },
      include: { timeSlots: { orderBy: { startTime: 'asc' } } },
      orderBy: { date: 'asc' },
    });

    schedules = schedules.filter((sched) => {
      const schedDate = new Date(sched.date);
      const schedDayStart = startOfDayIST(schedDate);
      return schedDayStart.getTime() >= todayStart.getTime();
    });

    const threshold = new Date(now.getTime() + leadMinutes * 60 * 1000);
    schedules = schedules.map((sched) => {
      const schedDate = new Date(sched.date);
      const schedDayStart = startOfDayIST(schedDate);
      if (schedDayStart.getTime() !== todayStart.getTime()) return sched;
      const availableTimeSlots = sched.timeSlots.filter((slot) => {
        const [h, m] = slot.startTime.split(":").map(Number);
        const slotStart = new Date(schedDayStart.getTime() + (h * 60 + m) * 60000);
        return slotStart.getTime() >= threshold.getTime() && slot.bookedSlots < slot.maxSlots;
      });
      return { ...sched, timeSlots: availableTimeSlots };
    });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}