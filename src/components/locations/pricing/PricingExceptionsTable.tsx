import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2 } from "lucide-react";
import type { PricingExceptionDTO } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

interface PricingExceptionsTableProps {
  data: PricingExceptionDTO[];
  isLoading: boolean;
  onEdit: (exception: PricingExceptionDTO) => void;
  onDelete: (exception: PricingExceptionDTO) => void;
}

export function PricingExceptionsTable({
  data,
  isLoading,
  onEdit,
  onDelete,
}: PricingExceptionsTableProps) {
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
    return <div className="text-center py-8 text-muted-foreground">Brak wyjątków cenowych.</div>;
  }

  const getStatus = (start: string, end: string) => {
    const now = new Date();
    const startDate = new Date(start);
    const endDate = new Date(end);
    // Set end date to end of day for comparison
    endDate.setHours(23, 59, 59, 999);

    if (now > endDate) return { label: "Zakończony", variant: "secondary" as const };
    if (now < startDate) return { label: "Przyszły", variant: "outline" as const };
    return { label: "Aktywny", variant: "default" as const };
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Zakres dat</TableHead>
            <TableHead>Zmiana</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Opis</TableHead>
            <TableHead className="text-right">Akcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => {
            const status = getStatus(item.start_date, item.end_date);
            const changeLabel =
              item.percentage_change > 0
                ? `+${item.percentage_change}%`
                : `${item.percentage_change}%`;
            const changeColor =
              item.percentage_change > 0
                ? "bg-red-100 text-red-800 hover:bg-red-100" // Higher price
                : "bg-green-100 text-green-800 hover:bg-green-100"; // Lower price

            return (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  {item.start_date} - {item.end_date}
                </TableCell>
                <TableCell>
                  <Badge className={changeColor} variant="outline">
                    {changeLabel}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </TableCell>
                <TableCell className="max-w-[200px] truncate" title={item.description || ""}>
                  {item.description || "-"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
                      <Edit2 className="h-4 w-4" />
                      <span className="sr-only">Edytuj</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => onDelete(item)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Usuń</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
