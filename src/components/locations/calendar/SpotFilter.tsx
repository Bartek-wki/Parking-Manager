import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSpots } from "@/lib/queries/spots";

interface SpotFilterProps {
  locationId: string;
  value: string;
  onChange: (value: string) => void;
}

export function SpotFilter({ locationId, value, onChange }: SpotFilterProps) {
  const { data: spots, isLoading } = useSpots(locationId);

  return (
    <Select value={value} onValueChange={onChange} disabled={isLoading}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Wszystkie miejsca" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Wszystkie miejsca</SelectItem>
        {spots?.map((spot) => (
          <SelectItem key={spot.id} value={spot.id}>
            {spot.spot_number}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
