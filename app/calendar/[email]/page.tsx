"use client";

import { format, isBefore, startOfDay, startOfWeek, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameDay } from "date-fns";
import { useEffect, useState, useCallback, useMemo, use } from "react";
import { useNotifications } from "@/components/ui/notifications";

function formatTimeTo12Hour(time24: string): string {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

interface PublicCalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  schedules: Schedule[];
  userName: string;
}

function PublicCalendar({ selectedDate, onDateSelect, schedules, userName }: PublicCalendarProps) {
  const [viewDate, setViewDate] = useState(new Date());
  const today = startOfDay(new Date());
  
  const monthStart = startOfMonth(viewDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = startOfWeek(endOfMonth(viewDate), { weekStartsOn: 0 });
  
  const days = eachDayOfInterval({ start: calendarStart, end: new Date(calendarEnd.getTime() + 6 * 24 * 60 * 60 * 1000) });
  
  const previousMonth = () => setViewDate(subMonths(viewDate, 1));
  const nextMonth = () => setViewDate(addMonths(viewDate, 1));
  const goToToday = () => {
    setViewDate(new Date());
    onDateSelect(today);
  };
  
  const hasAvailableSlots = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const schedule = schedules.find(s => {
      const scheduleDate = s.date instanceof Date ? s.date : new Date(s.date);
      return format(scheduleDate, 'yyyy-MM-dd') === dateStr;
    });
    return schedule && schedule.timeSlots && schedule.timeSlots.some(slot => slot.bookedSlots < slot.maxSlots);
  };
  
  const getAvailableSlotCount = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const schedule = schedules.find(s => {
      const scheduleDate = s.date instanceof Date ? s.date : new Date(s.date);
      return format(scheduleDate, 'yyyy-MM-dd') === dateStr;
    });
    if (!schedule) return 0;
    
    return schedule.timeSlots.reduce((count, slot) => count + (slot.maxSlots - slot.bookedSlots), 0);
  };
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6 px-2 rounded-lg border p-3" style={{ background: "var(--surface-2)", borderColor: "var(--border-subtle)" }}>
        <div>
          <h1 className="text-3xl font-bold">{userName} Schedule</h1>
          <h2 className="text-xl font-medium mt-1">{format(viewDate, 'MMMM yyyy')}</h2>
          <p className="text-sm opacity-60 mt-1">Click on a date to view available time slots</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={goToToday} className="px-3 py-1.5 text-sm rounded-lg border transition-colors" style={{ borderColor: "color-mix(in srgb, var(--foreground) 20%, transparent)", background: "color-mix(in srgb, var(--foreground) 5%, transparent)" }}>Today</button>
          <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: "color-mix(in srgb, var(--foreground) 20%, transparent)" }}>
            <button onClick={previousMonth} className="px-3 py-1.5 hover:bg-opacity-20 transition-colors" style={{ background: "color-mix(in srgb, var(--foreground) 5%, transparent)" }}>←</button>
            <button onClick={nextMonth} className="px-3 py-1.5 hover:bg-opacity-20 transition-colors border-l" style={{ background: "color-mix(in srgb, var(--foreground) 5%, transparent)", borderColor: "color-mix(in srgb, var(--foreground) 20%, transparent)" }}>→</button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-7 mb-2">
        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
          <div key={day} className="p-3 text-center">
            <div className="text-sm font-medium opacity-70">{day.slice(0, 3)}</div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, dayIdx) => {
          const isCurrentMonth = day.getMonth() === viewDate.getMonth();
          const isPast = isBefore(day, today);
          const isTodayDate = isToday(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const hasSlots = hasAvailableSlots(day);
          const availableCount = getAvailableSlotCount(day);
          
          return (
            <button
              key={dayIdx}
              onClick={() => onDateSelect(day)}
              disabled={isPast || !hasSlots}
              className={`relative h-20 p-2 rounded-lg transition-all duration-200 flex flex-col items-center justify-center ${!isCurrentMonth ? 'opacity-30' : isPast || !hasSlots ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:shadow-md cursor-pointer'}`}
              style={{
                background: isSelected ? 'var(--foreground)' : hasSlots ? 'color-mix(in srgb, var(--foreground) 12%, transparent)' : isTodayDate ? 'color-mix(in srgb, var(--foreground) 8%, transparent)' : 'color-mix(in srgb, var(--foreground) 3%, transparent)',
                color: isSelected ? 'var(--background)' : 'var(--foreground)',
                border: isTodayDate && !isSelected ? '2px solid var(--foreground)' : '1px solid color-mix(in srgb, var(--foreground) 15%, transparent)',
              }}
            >
              <div className={`text-lg font-semibold ${isSelected ? 'text-current' : isTodayDate ? 'font-bold' : ''}`}>{format(day, 'd')}</div>
              {hasSlots && availableCount > 0 && (
                <div className="mt-1 flex flex-col items-center">
                  <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-current opacity-70' : 'bg-green-500'}`} />
                  <div className={`text-xs mt-0.5 ${isSelected ? 'text-current opacity-80' : 'opacity-70'}`}>{availableCount === 1 ? '1 slot' : `${availableCount} slots`}</div>
                </div>
              )}
              {isTodayDate && (
                <div className="absolute top-1 right-1">
                  <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-current' : 'bg-blue-500'}`} />
                </div>
              )}
            </button>
          );
        })}
      </div>
      
      <div className="flex flex-wrap gap-4 mt-6 px-2 text-sm">
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded border-2" style={{ borderColor: 'var(--foreground)' }} /> <span>Today</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded" style={{ background: 'var(--foreground)' }} /> <span>Selected</span></div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--foreground) 12%, transparent)' }}><div className="w-2 h-2 rounded-full bg-green-500" /></div> <span>Available</span></div>
      </div>
    </div>
  );
}

interface SchedulePageProps { params: Promise<{ email: string }> }
interface TimeSlot { id: string; startTime: string; endTime: string; maxSlots: number; bookedSlots: number; }
interface Schedule { id: string; userId: string; date: Date; timeSlots: TimeSlot[]; createdAt: Date; updatedAt: Date; }

export default function PublicSchedulePage({ params }: SchedulePageProps) {
  const { notify } = useNotifications();
  const { email } = use(params);
  const [user, setUser] = useState<{ id: string; email: string; name?: string; isPublic: boolean } | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [isBooking, setIsBooking] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [notes, setNotes] = useState("");

  const today = useMemo(() => startOfDay(new Date()), []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = await fetch(`/api/users/${email}`);
        if (!userResponse.ok) {
          if (userResponse.status === 404) { setError("User not found"); return; }
          throw new Error("Failed to fetch user data");
        }
        const userData = await userResponse.json();
        setUser(userData);
        if (userData && userData.isPublic === false) { setError("This user's schedule is currently private."); return; }

        const schedulesResponse = await fetch(`/api/schedules/public/${email}?leadMinutes=30`);
        if (!schedulesResponse.ok) throw new Error("Failed to fetch schedules");
        const schedulesData = await schedulesResponse.json();
        const formatted = schedulesData
          .map((s: { id: string; userId: string; date: string; timeSlots: TimeSlot[]; createdAt: string; updatedAt: string }) => ({ ...s, date: new Date(s.date), createdAt: new Date(s.createdAt), updatedAt: new Date(s.updatedAt) }))
          .filter((s: Schedule) => !isBefore(s.date, today) && s.timeSlots && s.timeSlots.length > 0);
        setSchedules(formatted);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [email, today]);

  useEffect(() => { if (!selectedDate) setSelectedDate(today); }, [selectedDate, today]);

  const selectedSchedule = useMemo(() => {
    if (!selectedDate) return null;
    const match = schedules.find((s) => format(s.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd") && s.timeSlots && s.timeSlots.length > 0);
    return match ?? null;
  }, [schedules, selectedDate]);

  const handleDateSelect = useCallback((date: Date) => {
    const picked = startOfDay(date);
    if (isBefore(picked, today)) {
notify({ title: "Cannot view past dates", description: "You can only view availability for today and future dates.", variant: "destructive" });
      return;
    }
    setSelectedDate(picked);
  }, [today]);

  async function submitBooking() {
    if (!selectedDate || !selectedSlot) return;
    try {
      setIsBooking(true);
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, date: format(selectedDate, "yyyy-MM-dd"), startTime: selectedSlot.startTime, endTime: selectedSlot.endTime, guestName, guestEmail, notes }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.message || "Failed to book");
      }
notify({ title: "Booked!", description: `You're in for ${formatTimeTo12Hour(selectedSlot.startTime)}-${formatTimeTo12Hour(selectedSlot.endTime)}.` });

      const schedulesResponse = await fetch(`/api/schedules/public/${email}?leadMinutes=30`);
      const schedulesData = await schedulesResponse.json();
      const formatted = schedulesData
        .map((s: { id: string; userId: string; date: string; timeSlots: TimeSlot[]; createdAt: string; updatedAt: string }) => ({ ...s, date: new Date(s.date), createdAt: new Date(s.createdAt), updatedAt: new Date(s.updatedAt) }))
        .filter((s: Schedule) => !isBefore(s.date, today) && s.timeSlots && s.timeSlots.length > 0);
      setSchedules(formatted);

      setSelectedSlot(null);
      setGuestName("");
      setGuestEmail("");
      setNotes("");
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "An unknown error occurred";
notify({ title: "Couldn't book", description: message, variant: "destructive" });
    } finally {
      setIsBooking(false);
    }
  }

  if (loading) return <div className="container mx-auto py-8">Loading...</div>;
  if (error) return <div className="container mx-auto py-8">{error}</div>;
  if (!user) return <div className="container mx-auto py-8">User not found</div>;

  return (
    <div className="w-full py-8 px-4">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-2/3">
          <div className="rounded-xl shadow-lg p-6 border" style={{ background: "var(--surface-1)", borderColor: "var(--border-subtle)" }}>
            <PublicCalendar selectedDate={selectedDate} onDateSelect={handleDateSelect} schedules={schedules} userName={user.name || user.email} />
          </div>
        </div>

        <div className="w-full lg:w-1/3">
          <div className="rounded-xl shadow-lg p-6 border" style={{ background: "var(--background)", borderColor: "color-mix(in srgb, var(--foreground) 15%, transparent)" }}>
            <h2 className="text-xl font-semibold mb-4">{selectedDate ? `Available Time Slots for ${format(selectedDate, "MMMM d, yyyy")}` : "Select a date to view available time slots"}</h2>

            {selectedDate && isBefore(selectedDate, today) ? (
              <div className="text-center py-8">No time slots available for past dates</div>
            ) : selectedSchedule ? (
              <div>
                <div className="mb-4">
                  <p className="text-sm">{selectedSchedule.timeSlots.length} time slot{selectedSchedule.timeSlots.length === 1 ? '' : 's'} available</p>
                </div>
                <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto">
                  {selectedSchedule.timeSlots.map((slot) => (
                    <button key={slot.id} onClick={() => setSelectedSlot(slot)} className={`p-3 border rounded-md text-left ${selectedSlot?.id === slot.id ? 'ring-2' : ''}`} style={{ borderColor: "color-mix(in srgb, var(--foreground) 20%, transparent)" }}>
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{formatTimeTo12Hour(slot.startTime)}-{formatTimeTo12Hour(slot.endTime)}</div>
                        <div className="text-sm text-opacity-70">{slot.maxSlots - slot.bookedSlots}/{slot.maxSlots} available</div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2">
                  <input placeholder="Your name" value={guestName} onChange={(e) => setGuestName(e.target.value)} className="w-full px-2 py-2 rounded border text-sm" />
                  <input placeholder="Your email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} className="w-full px-2 py-2 rounded border text-sm" />
                  <textarea placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full px-2 py-2 rounded border text-sm" />
                  <button disabled={!selectedSlot || !guestName || !guestEmail || isBooking} onClick={submitBooking} className="px-4 py-2 rounded-md" style={{ background: "var(--foreground)", color: "var(--background)", opacity: !selectedSlot || !guestName || !guestEmail || isBooking ? 0.6 : 1 }}>
                    {isBooking ? 'Booking...' : 'Book'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">No time slots available for this date</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}