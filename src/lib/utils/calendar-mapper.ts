import type { BookingCalendarDTO, CalendarEventVM } from "@/types";
import { addDays, parseISO, format, differenceInDays } from "date-fns";

export function mapBookingToCalendarEvent(booking: BookingCalendarDTO): CalendarEventVM {
  // FullCalendar requires exclusive end date for all-day events
  // end_date in DB is inclusive (e.g., 2023-10-05) -> FullCalendar needs 2023-10-06
  // If end_date is null (permanent), we might need to handle it.
  // For now, if no end_date, let's assume it goes indefinitely, but FullCalendar needs an end.
  // The query filters by a date range, so we should arguably cap it at the view range or just let it be.
  // However, `BookingDTO` has `end_date: string | null`.

  let end = "";
  if (booking.end_date) {
    end = format(addDays(parseISO(booking.end_date), 1), "yyyy-MM-dd");
  } else {
    // For permanent bookings, we don't set an end date in FullCalendar?
    // Or we set it to far future?
    // If we don't set end, it defaults to 1 day if allDay is true, or uses start.
    // We should probably set it to a very distant future or handle it in the view.
    // But for the calendar view to show it spanning across the month, we need an end date.
    // We can't know the view range here easily without passing it in.
    // However, usually permanent bookings are just long bars.
    // Let's set it to something reasonable or leave empty and let the recurring logic handle it if we used recurring events (but we aren't).
    // If we leave it empty, it shows as a single day dot.
    // Fix: If it's null, it means "ongoing". We should probably set it to a date far enough or handled by the query range limit?
    // The `listBookings` query filters `lte("start_date", params.endDate)` and `or(end_date.is.null, ...)`
    // Ideally, the event should extend to at least the end of the current view.
    // But the mapper is pure.
    // Let's set a placeholder far future if null, e.g., next year.
    // Or better, 2100.
    end = "2100-01-01";
  }

  const clientName = booking.client
    ? `${booking.client.first_name} ${booking.client.last_name}`
    : "Unknown Client";

  const spotName = booking.spot ? `(${booking.spot.spot_number})` : "";
  const title = `${clientName} ${spotName}`;

  // US-099 Ending Soon logic
  // "Ending soon" <= 3 days.
  let isEndingSoon = false;
  if (booking.end_date) {
    const daysUntilEnd = differenceInDays(parseISO(booking.end_date), new Date());
    isEndingSoon = daysUntilEnd >= 0 && daysUntilEnd <= 3;
  }

  // Class names based on status
  const classNames: string[] = [];

  if (booking.type === "permanent") {
    classNames.push("event-pernament-color");
  }

  return {
    id: booking.id,
    title,
    start: booking.start_date,
    end,
    allDay: true,
    extendedProps: {
      spot_id: booking.spot_id,
      client_id: booking.client_id,
      status: booking.status,
      payment_status: booking.payment_status,
      is_ending_soon: isEndingSoon,
      type: booking.type,
    },
    classNames,
  };
}
