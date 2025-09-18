"use client";

import { useState, useCallback, useEffect } from "react";
import { format, startOfWeek, isBefore, startOfDay, isSameDay, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isToday } from "date-fns";
import { useNotifications } from "@/components/ui/notifications";

function formatTimeTo12Hour(time24: string): string {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

interface TimeSlot {
  id?: string;
  startTime: string;
  endTime: string;
  maxSlots: number;
  bookedSlots: number;
}

interface Schedule {
  id: string; 
  userId: string; 
  date: Date; 
  timeSlots: TimeSlot[]; 
  createdAt: Date; 
  updatedAt: Date;
}

interface ModernCalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  schedules: Schedule[];
  onMonthChange?: (month: Date) => void;
  isLoading?: boolean;
}

function ModernCalendar({ selectedDate, onDateSelect, schedules, onMonthChange, isLoading }: ModernCalendarProps) {
  const [viewDate, setViewDate] = useState(new Date());
  const today = startOfDay(new Date());
  
  const monthStart = startOfMonth(viewDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = startOfWeek(endOfMonth(viewDate), { weekStartsOn: 0 });
  
  const days = eachDayOfInterval({ start: calendarStart, end: new Date(calendarEnd.getTime() + 6 * 24 * 60 * 60 * 1000) });
  
  const previousMonth = () => { const newDate = subMonths(viewDate, 1); setViewDate(newDate); onMonthChange?.(newDate); };
  const nextMonth = () => { const newDate = addMonths(viewDate, 1); setViewDate(newDate); onMonthChange?.(newDate); };
  const goToToday = () => { const newDate = new Date(); setViewDate(newDate); onMonthChange?.(newDate); onDateSelect(today); };
  
  useEffect(() => { onMonthChange?.(viewDate); }, [viewDate, onMonthChange]);
  
  const hasSchedule = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const schedule = schedules.find(s => {
      const scheduleDate = s.date instanceof Date ? s.date : new Date(s.date);
      return format(scheduleDate, 'yyyy-MM-dd') === dateStr;
    });
    return schedule && schedule.timeSlots && schedule.timeSlots.length > 0;
  };
  
  const getTotalAvailableSlots = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const schedule = schedules.find(s => {
      const scheduleDate = s.date instanceof Date ? s.date : new Date(s.date);
      return format(scheduleDate, 'yyyy-MM-dd') === dateStr;
    });
    if (!schedule) return 0;
    return schedule.timeSlots.reduce((total, slot) => total + (slot.maxSlots - slot.bookedSlots), 0);
  };
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6 px-2 rounded-lg border p-3" style={{ background: "var(--surface-2)", borderColor: "var(--border-subtle)" }}>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">{format(viewDate, 'MMMM yyyy')}</h2>
            {isLoading && (<div className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-blue-500 animate-spin" />)}
          </div>
          <p className="text-sm opacity-60 mt-1">Select a date to manage your schedule</p>
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
        {['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map(day => (
          <div key={day} className="p-3 text-center">
            <div className="text-sm font-medium opacity-70">{day.slice(0,3)}</div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, dayIdx) => {
          const isCurrentMonth = day.getMonth() === viewDate.getMonth();
          const isPast = isBefore(day, today);
          const isTodayDate = isToday(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const hasScheduleData = hasSchedule(day);
          const totalAvailableSlots = getTotalAvailableSlots(day);
          
          return (
            <button
              key={dayIdx}
              onClick={() => onDateSelect(day)}
              className={`relative h-20 p-2 rounded-lg transition-all duration-200 hover:scale-105 flex flex-col items-center justify-center ${!isCurrentMonth ? 'opacity-30' : isPast ? 'opacity-50' : 'hover:shadow-md'}`}
              style={{
                background: isSelected ? 'var(--foreground)' : hasScheduleData ? 'color-mix(in srgb, var(--foreground) 12%, transparent)' : 'color-mix(in srgb, var(--foreground) 3%, transparent)',
                color: isSelected ? 'var(--background)' : 'var(--foreground)'
              }}
            >
              <div className={`text-lg font-semibold ${isSelected ? 'text-current' : isTodayDate ? 'font-bold' : ''}`}>{format(day, 'd')}</div>
              {hasScheduleData && totalAvailableSlots > 0 && (
                <div className="mt-1 flex flex-col items-center">
                  <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-current opacity-70' : 'bg-green-500'}`} />
                  <div className={`text-xs mt-0.5 ${isSelected ? 'text-current opacity-80' : 'opacity-70'}`}>{totalAvailableSlots === 1 ? '1 slot' : `${totalAvailableSlots} slots`}</div>
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
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded flex items-center justify-center" style={{ background: 'color-mix(in srgb, var(--foreground) 12%, transparent)' }}><div className="w-2 h-2 rounded-full bg-green-500" /></div> <span>Has Schedule</span></div>
      </div>
    </div>
  );
}

interface CalendarProps { userId: string; }
interface Booking {
  id: string; startTime: string; endTime: string; guestName: string; guestEmail: string; notes?: string | null; status: "PENDING" | "CONFIRMED" | "CANCELED"; createdAt: string;
}

export default function Calendar({ userId }: CalendarProps) {
  const { notify } = useNotifications();
  const [selectedDate, setSelectedDate] = useState<Date | null>(startOfDay(new Date()));
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<TimeSlot[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [monthlySchedules, setMonthlySchedules] = useState<Schedule[]>([]);
  const [monthlySchedulesLoading, setMonthlySchedulesLoading] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [newSlotStart, setNewSlotStart] = useState<string>("");
  const [newSlotEnd, setNewSlotEnd] = useState<string>("");
  const [newSlotMaxSlots, setNewSlotMaxSlots] = useState<number>(1);
  
  const [selectedReplicationDates, setSelectedReplicationDates] = useState<string[]>([]);
  const [showReplicationModal, setShowReplicationModal] = useState(false);

  function ReplicationCalendar({ selectedDates, onDateToggle, currentDate }: { selectedDates: string[]; onDateToggle: (d: string) => void; currentDate: Date | null; }) {
    const [viewDate, setViewDate] = useState(currentDate || new Date());

    useEffect(() => { if (currentDate) setViewDate(currentDate); }, [currentDate]);

    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(viewDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: calendarStart, end: monthEnd });

    const previousMonth = () => setViewDate(subMonths(viewDate, 1));
    const nextMonth = () => setViewDate(addMonths(viewDate, 1));

    const today = startOfDay(new Date());
    const currentDateStr = currentDate ? format(currentDate, 'yyyy-MM-dd') : '';

    return (
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <button onClick={previousMonth} className="p-1 rounded hover:bg-opacity-20" style={{ background: "color-mix(in srgb, var(--foreground) 10%, transparent)" }}>←</button>
          <div className="text-center">
            <h3 className="text-sm font-medium">{format(viewDate, 'MMMM yyyy')}</h3>
            {currentDate && viewDate.getMonth() === currentDate.getMonth() && viewDate.getFullYear() === currentDate.getFullYear() && (
              <p className="text-xs opacity-60">(editing {format(currentDate, 'MMM d')})</p>
            )}
          </div>
          <button onClick={nextMonth} className="p-1 rounded hover:bg-opacity-20" style={{ background: "color-mix(in srgb, var(--foreground) 10%, transparent)" }}>→</button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-1">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className="text-xs text-center py-1 font-medium opacity-70">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const dayStr = format(day, 'yyyy-MM-dd');
            const isSelected = selectedDates.includes(dayStr);
            const isPast = isBefore(day, today);
            const isCurrentMonth = day.getMonth() === viewDate.getMonth();
            const isCurrentDate = dayStr === currentDateStr;
            const isTodayDate = isToday(day);

            return (
              <button key={dayStr} onClick={() => !isPast && isCurrentMonth && !isCurrentDate && onDateToggle(dayStr)} disabled={isPast || !isCurrentMonth || isCurrentDate}
                className={`text-xs h-8 rounded transition-colors ${isPast || !isCurrentMonth ? 'opacity-30 cursor-not-allowed' : isCurrentDate ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80 cursor-pointer'}`}
                style={{
                  background: isSelected ? 'var(--foreground)' : isTodayDate ? 'color-mix(in srgb, var(--foreground) 20%, transparent)' : isCurrentDate ? 'color-mix(in srgb, var(--foreground) 15%, transparent)' : 'color-mix(in srgb, var(--foreground) 5%, transparent)',
                  color: isSelected ? 'var(--background)' : 'var(--foreground)',
                  border: isTodayDate && !isSelected ? '1px solid var(--foreground)' : 'none'
                }}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>

        <div className="mt-3 text-xs opacity-70">
          <div className="flex flex-wrap gap-2 justify-center">
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded" style={{ background: 'var(--foreground)' }}></div><span>Selected</span></div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded border" style={{ borderColor: 'var(--foreground)' }}></div><span>Today</span></div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded" style={{ background: 'color-mix(in srgb, var(--foreground) 15%, transparent)' }}></div><span>Current</span></div>
          </div>
        </div>
      </div>
    );
  }

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isBookingsLoading, setIsBookingsLoading] = useState(false);

  const fetchSchedules = useCallback(async (date: Date) => {
    try {
      setIsLoading(true);
      const formattedDate = format(date, "yyyy-MM-dd");
      const response = await fetch(`/api/schedules?date=${formattedDate}&userId=${userId}`);
      if (!response.ok) throw new Error("Failed to fetch schedules");
      const data = await response.json();
      if (data.length > 0 && data[0].timeSlots.length === 0) {
        setSchedules([]);
        setSelectedTimeSlots([]);
      } else {
        setSchedules(data);
        setSelectedTimeSlots(data.length > 0 ? data[0].timeSlots : []);
      }
    } catch {
notify({ title: "Error", description: "Failed to fetch your schedule", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [userId]);
  
  const fetchMonthlySchedules = useCallback(async (month: Date) => {
    try {
      setMonthlySchedulesLoading(true);
      const monthStart = format(startOfMonth(month), "yyyy-MM-dd");
      const monthEnd = format(endOfMonth(month), "yyyy-MM-dd");
      const response = await fetch(`/api/schedules?userId=${userId}&startDate=${monthStart}&endDate=${monthEnd}`);
      if (!response.ok) {
        const keyDates = [] as string[];
        const start = startOfMonth(month);
        const end = endOfMonth(month);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 3)) {
          keyDates.push(format(d, "yyyy-MM-dd"));
        }
        const results = await Promise.all(keyDates.map(dateStr => fetch(`/api/schedules?date=${dateStr}&userId=${userId}`).then(res => res.ok ? res.json() : []).catch(() => [])));
        const schedules = results.flat().map((schedule: any) => ({ ...schedule, date: new Date(schedule.date) })).filter((schedule: Schedule) => schedule.timeSlots?.length > 0);
        setMonthlySchedules(schedules);
        return;
      }
      const data = await response.json();
      const schedules = data.map((schedule: { id: string; date: string; timeSlots: TimeSlot[] }) => ({ ...schedule, date: new Date(schedule.date) })).filter((schedule: Schedule) => schedule.timeSlots?.length > 0);
      setMonthlySchedules(schedules);
    } catch (error) {
      console.error("Failed to fetch monthly schedules:", error);
      setMonthlySchedules([]);
    } finally {
      setMonthlySchedulesLoading(false);
    }
  }, [userId]);

  const fetchBookings = useCallback(async (date: Date) => {
    try {
      setIsBookingsLoading(true);
      const formattedDate = format(date, "yyyy-MM-dd");
      const res = await fetch(`/api/bookings?userId=${userId}&date=${formattedDate}`);
      if (!res.ok) throw new Error("Failed to fetch bookings");
      const data: Booking[] = await res.json();
      setBookings(data);
    } catch {
notify({ title: "Error", description: "Failed to fetch bookings", variant: "destructive" });
    } finally {
      setIsBookingsLoading(false);
    }
  }, [userId]);

  const deleteBooking = async (bookingId: string) => {
    if (!selectedDate) return;
    const confirmed = typeof window !== 'undefined' ? window.confirm("Delete this booking and restore its slot?") : false;
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete booking");
notify({ title: "Deleted", description: "Booking removed and slot restored" });
      fetchBookings(selectedDate);
      fetchSchedules(selectedDate);
      fetchMonthlySchedules(selectedDate);
    } catch {
notify({ title: "Error", description: "Failed to delete booking", variant: "destructive" });
    }
  };

  const handleDateSelect = useCallback((date: Date) => {
    const selected = startOfDay(date);
    setSelectedDate(selected);
    setIsFormOpen(true);
    setIsEditing(false);
    fetchSchedules(selected);
    fetchBookings(selected);
  }, [fetchSchedules, fetchBookings]);

  useEffect(() => { if (selectedDate) { fetchSchedules(selectedDate); fetchBookings(selectedDate); } }, [selectedDate, fetchSchedules, fetchBookings]);
  useEffect(() => { fetchMonthlySchedules(new Date()); }, [fetchMonthlySchedules]);

  const addTimeSlot = () => {
    if (!newSlotStart || !newSlotEnd || newSlotMaxSlots < 1) {
notify({ title: "Error", description: "Please fill in all time slot details", variant: "destructive" });
      return;
    }
    if (newSlotStart >= newSlotEnd) {
notify({ title: "Error", description: "End time must be after start time", variant: "destructive" });
      return;
    }
    const hasOverlap = selectedTimeSlots.some(slot => (newSlotStart < slot.endTime && newSlotEnd > slot.startTime));
    if (hasOverlap) {
notify({ title: "Error", description: "Time slots cannot overlap", variant: "destructive" });
      return;
    }
    const newSlot: TimeSlot = { startTime: newSlotStart, endTime: newSlotEnd, maxSlots: newSlotMaxSlots, bookedSlots: 0 };
    setSelectedTimeSlots(prev => [...prev, newSlot].sort((a, b) => a.startTime.localeCompare(b.startTime)));
    setNewSlotStart(""); setNewSlotEnd(""); setNewSlotMaxSlots(1);
  };
  
  const removeTimeSlot = (index: number) => { setSelectedTimeSlots(prev => prev.filter((_, i) => i !== index)); };
  const updateTimeSlotMaxSlots = (index: number, maxSlots: number) => { if (maxSlots < 1) return; setSelectedTimeSlots(prev => prev.map((slot, i) => i === index ? { ...slot, maxSlots } : slot)); };

  const saveSchedule = async () => {
    if (!selectedDate) return;
    const today = startOfDay(new Date());
    const selectedDateStart = startOfDay(selectedDate);
    if (isBefore(selectedDateStart, today)) {
notify({ title: "Cannot edit past dates", description: "You can only edit today's and future dates", variant: "destructive" });
      return;
    }
    try {
      setIsLoading(true);
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      const replicateDates = selectedReplicationDates.length > 0 ? selectedReplicationDates : undefined;
      const response = await fetch("/api/schedules", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date: formattedDate, timeSlots: selectedTimeSlots, userId, replicateDates }) });
      if (!response.ok) throw new Error("Failed to save schedule");
      const data = await response.json();
notify({ title: "Success", description: data.message || "Your schedule has been updated" });
      const currentViewDate = selectedDate || new Date();
      fetchMonthlySchedules(currentViewDate);
      if (selectedDate) { fetchSchedules(selectedDate); }
      if (selectedTimeSlots.length === 0) { setSchedules([]); setSelectedTimeSlots([]); setIsFormOpen(true); setIsEditing(true); } else { setIsFormOpen(false); setIsEditing(false); setSelectedReplicationDates([]); setShowReplicationModal(false); }
    } catch {
notify({ title: "Error", description: "Failed to save your schedule", variant: "destructive" });
    } finally { setIsLoading(false); }
  };

  const toggleReplicationDate = (dateStr: string) => { setSelectedReplicationDates(prev => prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr]); };
  const cancelEditing = () => { setIsEditing(false); if (selectedDate) fetchSchedules(selectedDate); };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="w-full lg:w-2/3">
        <div className="rounded-xl shadow-lg p-6 border" style={{ background: "var(--surface-1)", borderColor: "var(--border-subtle)" }}>
          <ModernCalendar selectedDate={selectedDate} onDateSelect={handleDateSelect} schedules={monthlySchedules} onMonthChange={fetchMonthlySchedules} isLoading={monthlySchedulesLoading} />
        </div>
      </div>

      {isFormOpen && selectedDate && (
        <div className="w-full lg:w-1/3 rounded-xl shadow-lg p-6 border" style={{ background: "var(--surface-1)", borderColor: "var(--border-subtle)" }}>
          <h2 className="text-xl font-semibold mb-4">{`Schedule for ${format(selectedDate, "MMMM d, yyyy")}`}</h2>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium">Booked</h3>
              <span className="text-sm">{isBookingsLoading ? "Loading..." : `${bookings.length} booking${bookings.length === 1 ? "" : "s"}`}</span>
            </div>

            {bookings.length === 0 ? (
              <div className="p-3 border rounded-md" style={{ borderColor: "color-mix(in srgb, var(--foreground) 20%, transparent)" }}>No bookings for this date</div>
            ) : (
              <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                {bookings.map((b) => (
                  <div key={b.id} className="p-3 border rounded-md group" style={{ background: "color-mix(in srgb, var(--foreground) 6%, transparent)", borderColor: "color-mix(in srgb, var(--foreground) 20%, transparent)" }}>
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{formatTimeTo12Hour(b.startTime)}-{formatTimeTo12Hour(b.endTime)}</div>
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--foreground)", color: "var(--background)" }}>{b.status.toLowerCase()}</span>
                    </div>
                    <div className="text-sm mt-1">{b.guestName} • <a className="underline" href={`mailto:${b.guestEmail}`}>{b.guestEmail}</a></div>
                    {b.notes ? <div className="text-sm mt-1">“{b.notes}”</div> : null}
                    <div className="mt-2 flex justify-end opacity-80 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => deleteBooking(b.id)} className="text-xs px-2 py-1 rounded-md border" style={{ borderColor: "color-mix(in srgb, var(--foreground) 25%, transparent)" }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {schedules.length > 0 && schedules[0].timeSlots.length > 0 && !isEditing ? (
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Available Time Slots</h3>
                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                  {schedules[0].timeSlots.map((slot, index) => (
                    <div key={index} className="p-3 rounded-md border" style={{ background: "color-mix(in srgb, var(--foreground) 6%, transparent)", borderColor: "color-mix(in srgb, var(--foreground) 20%, transparent)" }}>
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{formatTimeTo12Hour(slot.startTime)}-{formatTimeTo12Hour(slot.endTime)}</div>
                        <div className="text-sm text-opacity-70">{slot.maxSlots - slot.bookedSlots}/{slot.maxSlots} available</div>
                      </div>
                      {slot.bookedSlots > 0 && (<div className="mt-1 text-xs opacity-60">{slot.bookedSlots} booked</div>)}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button onClick={() => setIsEditing(true)} className="px-4 py-2 rounded-md" style={{ background: "var(--foreground)", color: "var(--background)" }}>Edit Schedule</button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3">Configure Time Slots</h3>

                <div className="mb-4">
                  <button onClick={() => setShowReplicationModal(!showReplicationModal)} className="px-3 py-2 rounded-md border" style={{ borderColor: "color-mix(in srgb, var(--foreground) 25%, transparent)" }}>
                    {showReplicationModal ? 'Hide replication' : 'Replicate to other dates'}
                  </button>
                  {showReplicationModal && (
                    <div className="mt-3 border rounded-md" style={{ borderColor: "color-mix(in srgb, var(--foreground) 20%, transparent)" }}>
                      <ReplicationCalendar selectedDates={selectedReplicationDates} onDateToggle={toggleReplicationDate} currentDate={selectedDate} />
                      {selectedReplicationDates.length > 0 && (
                        <p className="px-3 pb-3 text-xs opacity-70">{selectedReplicationDates.length} additional date(s) selected. Saving will overwrite their schedules and cancel mismatched bookings.</p>
                      )}
                    </div>
                  )}
                </div>
                <div className="p-4 border rounded-md mb-4" style={{ borderColor: "color-mix(in srgb, var(--foreground) 20%, transparent)" }}>
                  <h4 className="text-sm font-medium mb-3">Add Time Slot</h4>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div>
                      <label className="text-xs font-medium block mb-1">Start Time</label>
                      <input type="time" value={newSlotStart} onChange={(e) => setNewSlotStart(e.target.value)} className="w-full px-2 py-1 rounded border text-sm" />
                      <p className="text-xs opacity-60 mt-1">Will display in 12-hour format</p>
                    </div>
                    <div>
                      <label className="text-xs font-medium block mb-1">End Time</label>
                      <input type="time" value={newSlotEnd} onChange={(e) => setNewSlotEnd(e.target.value)} className="w-full px-2 py-1 rounded border text-sm" />
                      <p className="text-xs opacity-60 mt-1">Will display in 12-hour format</p>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="text-xs font-medium block mb-1">Available Slots</label>
                    <input type="number" value={newSlotMaxSlots} onChange={(e) => setNewSlotMaxSlots(parseInt(e.target.value) || 1)} className="w-full px-2 py-1 rounded border text-sm" />
                  </div>
                  <button onClick={addTimeSlot} className="px-3 py-2 rounded-md" style={{ background: "var(--foreground)", color: "var(--background)" }}>Add</button>
                </div>

                {selectedTimeSlots.length > 0 && (
                  <div className="grid grid-cols-1 gap-2">
                    {selectedTimeSlots.map((slot, index) => (
                      <div key={index} className="p-3 border rounded-md" style={{ borderColor: "color-mix(in srgb, var(--foreground) 20%, transparent)" }}>
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{formatTimeTo12Hour(slot.startTime)}-{formatTimeTo12Hour(slot.endTime)}</div>
                          <div className="flex items-center gap-2">
                            <input type="number" min={1} value={slot.maxSlots} onChange={(e) => updateTimeSlotMaxSlots(index, parseInt(e.target.value) || 1)} className="w-20 px-2 py-1 rounded border text-sm" />
                            <button onClick={() => removeTimeSlot(index)} className="text-xs px-2 py-1 rounded-md border" style={{ borderColor: "color-mix(in srgb, var(--foreground) 25%, transparent)" }}>Remove</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <button onClick={saveSchedule} className="px-4 py-2 rounded-md" style={{ background: "var(--foreground)", color: "var(--background)" }}>Save</button>
                <button onClick={cancelEditing} className="px-4 py-2 rounded-md border" style={{ borderColor: "color-mix(in srgb, var(--foreground) 25%, transparent)" }}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}