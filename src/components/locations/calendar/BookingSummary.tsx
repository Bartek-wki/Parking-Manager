import { format } from "date-fns";
import { pl } from "date-fns/locale";
import type { BookingDetailDTO } from "@/types";
import { Separator } from "@/components/ui/separator";
import { User, Calendar, CreditCard, MapPin, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";

interface BookingSummaryProps {
  booking: BookingDetailDTO;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export function BookingSummary({ booking, onEdit, onDelete, onClose }: BookingSummaryProps) {
  const { client, spot, location } = booking;

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "d MMMM yyyy", { locale: pl });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Rezerwacja #{booking.id.slice(0, 8)}</h3>
          <p className="text-sm text-muted-foreground">
            Utworzono: {formatDate(booking.created_at || new Date().toISOString())}
          </p>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={booking.status} />
          <StatusBadge status={booking.payment_status || "nieoplacone"} />
        </div>
      </div>

      <Separator />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Client Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4" />
            <span className="font-medium text-sm">Dane Klienta</span>
          </div>
          {client ? (
            <div className="pl-6">
              <p className="font-medium">
                {client.first_name} {client.last_name}
              </p>
              <p className="text-sm text-muted-foreground">{client.email}</p>
              <p className="text-sm text-muted-foreground">{client.phone}</p>
            </div>
          ) : (
            <p className="pl-6 text-sm text-muted-foreground">Brak danych klienta</p>
          )}
        </div>

        {/* Location Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="font-medium text-sm">Lokalizacja i Miejsce</span>
          </div>
          <div className="pl-6">
            <p className="font-medium">{location?.name || "Nieznana lokalizacja"}</p>
            <p className="text-sm">
              Miejsce: <span className="font-semibold">{spot?.spot_number || "Brak"}</span>
            </p>
          </div>
        </div>

        {/* Date Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span className="font-medium text-sm">Termin</span>
          </div>
          <div className="pl-6">
            <p className="text-sm">
              Od: <span className="font-medium">{formatDate(booking.start_date)}</span>
            </p>
            <p className="text-sm">
              Do:{" "}
              <span className="font-medium">
                {booking.end_date ? formatDate(booking.end_date) : "Bezterminowo"}
              </span>
            </p>
          </div>
        </div>

        {/* Financial Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CreditCard className="h-4 w-4" />
            <span className="font-medium text-sm">Płatność</span>
          </div>
          <div className="pl-6">
            <p className="text-sm">
              Koszt:{" "}
              <span className="font-medium">
                {booking.cost ? `${booking.cost} PLN` : "Nie ustalono"}
              </span>
            </p>
            <p className="text-sm">
              Typ:{" "}
              <span className="capitalize">
                {booking.type === "periodic" ? "Okresowa" : "Stała"}
              </span>
            </p>
          </div>
        </div>
      </div>

      <Separator />

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Zamknij
        </Button>
        <Button variant="destructive" onClick={onDelete}>
          <Trash2 className="mr-2 h-4 w-4" />
          Usuń
        </Button>
        <Button onClick={onEdit}>
          <Edit2 className="mr-2 h-4 w-4" />
          Edytuj
        </Button>
      </div>
    </div>
  );
}
