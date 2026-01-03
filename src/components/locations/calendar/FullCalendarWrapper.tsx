import { useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import type { CalendarEventVM } from "@/types";
import { cn } from "@/lib/utils";
import "@/styles/calendar.css";

interface FullCalendarWrapperProps {
  events: CalendarEventVM[];
  onDatesSet?: (dateInfo: any) => void;
  onEventClick?: (info: any) => void;
  onDateClick?: (info: any) => void;
  calendarRef: React.RefObject<FullCalendar | null>;
  initialView?: string;
}

export function FullCalendarWrapper({
  events,
  onDatesSet,
  onEventClick,
  onDateClick,
  calendarRef,
  initialView = "dayGridMonth",
}: FullCalendarWrapperProps) {
  // Custom render for event content
  const renderEventContent = (eventInfo: any) => {
    const props = eventInfo.event.extendedProps;
    const isEndingSoon = props.is_ending_soon;
    const paymentStatus = props.payment_status;

    // Determine status indicator color
    let statusColor = "bg-gray-400";
    if (paymentStatus === "oplacone") statusColor = "bg-emerald-500";
    else if (paymentStatus === "nieoplacone" && isEndingSoon) statusColor = "bg-red-500";
    else if (paymentStatus === "nieoplacone" && !isEndingSoon) statusColor = "bg-amber-500";

    return (
      <div className="flex items-center w-full overflow-hidden px-1 py-0.5 gap-1">
        <div className={cn("h-2 w-2 rounded-full shrink-0", statusColor)} />
        <div className="truncate text-xs font-medium leading-none">{eventInfo.event.title}</div>
      </div>
    );
  };

  return (
    <div className="w-full h-full calendar-wrapper">
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, listPlugin, interactionPlugin]}
        initialView={initialView}
        headerToolbar={false} // We use custom header
        locale="pl"
        events={events as any}
        eventContent={renderEventContent}
        datesSet={onDatesSet}
        eventClick={onEventClick}
        dateClick={onDateClick}
        selectable={true}
        unselectAuto={false}
        select={(info) => {
          // Fallback if dateClick doesn't fire but selection does
          if (onDateClick) onDateClick({ dateStr: info.startStr } as any);
        }}
        height="auto"
        contentHeight="auto"
        dayMaxEvents={true} // Allow "more" link
        firstDay={1} // Monday
        eventClassNames={(arg) => {
          return [
            ...(arg.event.classNames || []),
            "cursor-pointer",
            "transition-opacity",
            "hover:opacity-90",
          ];
        }}
      />
    </div>
  );
}
