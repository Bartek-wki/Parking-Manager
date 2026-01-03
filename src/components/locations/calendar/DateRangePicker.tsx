import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface DateRangePickerProps {
  startDate: string; // ISO date string YYYY-MM-DD
  endDate: string | undefined | null; // ISO date string YYYY-MM-DD or null
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string | null) => void;
  isPermanent?: boolean;
  errors?: {
    start?: string;
    end?: string;
  };
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  isPermanent = false,
  errors,
}: DateRangePickerProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="start-date">Data początkowa</Label>
        <Input
          id="start-date"
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className={errors?.start ? "border-destructive" : ""}
        />
        {errors?.start && <p className="text-xs text-destructive">{errors.start}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="end-date">Data końcowa</Label>
        <Input
          id="end-date"
          type="date"
          value={endDate || ""}
          onChange={(e) => onEndDateChange(e.target.value || null)}
          disabled={isPermanent}
          className={errors?.end ? "border-destructive" : ""}
        />
        {errors?.end && <p className="text-xs text-destructive">{errors.end}</p>}
        {isPermanent && <p className="text-xs text-muted-foreground">Rezerwacja bezterminowa</p>}
      </div>
    </div>
  );
}
