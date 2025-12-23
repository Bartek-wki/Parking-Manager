import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Edit2 } from "lucide-react";
import type { SpotDTO } from "@/types";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface SpotsTableProps {
  data: SpotDTO[];
  isLoading: boolean;
  onEdit: (spot: SpotDTO) => void;
  onToggleStatus: (spot: SpotDTO, isActive: boolean) => void;
}

export function SpotsTable({ data, isLoading, onEdit, onToggleStatus }: SpotsTableProps) {
  const [sortAsc, setSortAsc] = useState(true);

  // Natural sort
  const sortedData = [...data].sort((a, b) => {
    return sortAsc
      ? a.spot_number.localeCompare(b.spot_number, undefined, { numeric: true })
      : b.spot_number.localeCompare(a.spot_number, undefined, { numeric: true });
  });

  const handleSortToggle = () => {
    setSortAsc(!sortAsc);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (data.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">Brak miejsc parkingowych.</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer hover:bg-muted/50 w-[200px]"
              onClick={handleSortToggle}
            >
              Numer miejsca {sortAsc ? "↑" : "↓"}
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Akcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((spot) => (
            <TableRow key={spot.id}>
              <TableCell className="font-medium">{spot.spot_number}</TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={spot.is_active}
                    onCheckedChange={(checked) => onToggleStatus(spot, checked)}
                  />
                  <span className="text-sm text-muted-foreground">
                    {spot.is_active ? "Aktywne" : "Nieaktywne"}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon" onClick={() => onEdit(spot)}>
                  <Edit2 className="h-4 w-4" />
                  <span className="sr-only">Edytuj</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
