import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import Calendar from "@/components/calendar/Calendar";
import Navigation from "@/components/calendar/Navigation";
import { prisma } from "@/lib/db/prisma";

export default async function CalendarDashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="w-full">
      <Navigation id={user.id} />
      <div className="w-full py-6 px-6">
        <Calendar userId={session.user.id!} />
      </div>
    </div>
  );
}