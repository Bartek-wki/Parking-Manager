import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSpots } from "@/lib/queries/spots";

interface SpotSelectProps {
  locationId: string;
  value: string | undefined;
  onChange: (value: string) => void;
  error?: boolean;
}

export function SpotSelect({ locationId, value, onChange, error }: SpotSelectProps) {
  const { data: spots, isLoading } = useSpots(locationId);

  // Filter active spots (assuming is_active property exists on SpotDTO)
  // Based on types.ts: export type SpotDTO = Pick<Tables<"spots">, "id" | "spot_number" | "is_active">;
  const activeSpots = spots?.filter((spot) => spot.is_active) || [];

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={error ? "border-destructive" : ""}>
        <SelectValue placeholder={isLoading ? "Ładowanie..." : "Wybierz miejsce"} />
      </SelectTrigger>
      <SelectContent>
        {activeSpots.map((spot) => (
          <SelectItem key={spot.id} value={spot.id}>
            {spot.spot_number}
          </SelectItem>
        ))}
        {!isLoading && activeSpots.length === 0 && (
          <div className="p-2 text-sm text-muted-foreground text-center">Brak aktywnych miejsc</div>
        )}
      </SelectContent>
    </Select>
  );
}
