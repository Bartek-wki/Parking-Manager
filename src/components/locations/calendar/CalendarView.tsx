import { useState, useRef, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import type { DatesSetArg, EventClickArg } from "@fullcalendar/core";
import type { DateClickArg } from "@fullcalendar/interaction";
import { useCalendarBookings } from "@/lib/queries/bookings";
import { FullCalendarWrapper } from "./FullCalendarWrapper";
import { CalendarSkeleton } from "./CalendarSkeleton";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { CalendarHeader } from "./CalendarHeader";
import { SpotFilter } from "./SpotFilter";
import { BookingModal, type BookingModalMode } from "./BookingModal";

import { withQueryClient } from "@/lib/query-client";

interface CalendarViewProps {
  locationId: string;
}

function CalendarViewBase({ locationId }: CalendarViewProps) {
  const calendarRef = useRef<FullCalendar>(null);

  // State for query params
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    end: format(endOfMonth(new Date()), "yyyy-MM-dd"),
  });

  const [currentTitle, setCurrentTitle] = useState("");
  const [spotFilter, setSpotFilter] = useState<string>("all");

  // Modal State
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined);
  const [modalMode, setModalMode] = useState<BookingModalMode>("view");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch data
  const {
    data: events,
    isLoading,
    isFetching,
  } = useCalendarBookings({
    location_id: locationId,
    start_date: dateRange.start,
    end_date: dateRange.end,
  });

  // Handle calendar dates change (navigation)
  const handleDatesSet = useCallback((arg: DatesSetArg) => {
    // FullCalendar gives us the visible range.
    // We update our query params to fetch data for this range.
    const startStr = format(arg.start, "yyyy-MM-dd");
    const endStr = format(arg.end, "yyyy-MM-dd");

    // Avoid setting if same (prevent loop if strict equality check fails, though format should match)
    setDateRange((prev) => {
      if (prev.start === startStr && prev.end === endStr) return prev;
      return { start: startStr, end: endStr };
    });

    setCurrentTitle(arg.view.title);
  }, []);

  // Filter events client-side for smoother UX on small datasets
  // or if we want to filter by spot after fetching all for the month.
  // The plan implies "SpotFilter" which usually filters the view.
  const filteredEvents =
    events?.filter((event) => {
      if (spotFilter === "all") return true;
      return event.extendedProps.spot_id === spotFilter;
    }) || [];

  // Navigation handlers
  const handlePrev = () => {
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.prev();
  };

  const handleNext = () => {
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.next();
  };

  const handleToday = () => {
    const calendarApi = calendarRef.current?.getApi();
    calendarApi?.today();
  };

  const handleEventClick = (info: EventClickArg) => {
    setSelectedBookingId(info.event.id);
    setModalMode("view");
    setSelectedDate(undefined);
    setIsModalOpen(true);
  };

  const handleDateClick = (info: DateClickArg) => {
    setSelectedBookingId(null);
    setModalMode("create");
    setSelectedDate(info.dateStr);
    setIsModalOpen(true);
  };

  const handleCloseModal = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      // Small delay to clear state after animation could be better, but instant is fine
      setTimeout(() => {
        setSelectedBookingId(null);
        setSelectedDate(undefined);
      }, 300);
    }
  };

  if (isLoading && !events) {
    return <CalendarSkeleton />;
  }

  return (
    <div className="flex flex-col space-y-4 h-full">
      <CalendarHeader
        title={currentTitle}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
      >
        <SpotFilter locationId={locationId} value={spotFilter} onChange={setSpotFilter} />
      </CalendarHeader>

      <div className="relative flex-1 border rounded-md bg-background p-4 shadow-sm min-h-[600px]">
        {/* Loading Overlay when refetching */}
        {isFetching && events && (
          <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center backdrop-blur-[1px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        <FullCalendarWrapper
          calendarRef={calendarRef}
          events={filteredEvents}
          onDatesSet={handleDatesSet}
          onEventClick={handleEventClick}
          onDateClick={handleDateClick}
        />
      </div>

      <BookingModal
        locationId={locationId}
        bookingId={selectedBookingId}
        initialDate={selectedDate}
        mode={modalMode}
        open={isModalOpen}
        onOpenChange={handleCloseModal}
      />
    </div>
  );
}

export const CalendarView = withQueryClient(CalendarViewBase);
