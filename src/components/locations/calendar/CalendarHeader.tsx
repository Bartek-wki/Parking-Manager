import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarHeaderProps {
  title: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  children?: React.ReactNode;
}

export function CalendarHeader({ title, onPrev, onNext, onToday, children }: CalendarHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-2">
      <div className="flex items-center space-x-4">
        <h2 className="text-2xl font-bold capitalize text-foreground min-w-[200px]">{title}</h2>
        <div className="flex items-center space-x-1">
          <Button variant="outline" size="icon" onClick={onPrev} title="Poprzedni miesiąc">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={onNext} title="Następny miesiąc">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={onToday}>
            Dzisiaj
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2 w-full sm:w-auto">{children}</div>
    </div>
  );
}
