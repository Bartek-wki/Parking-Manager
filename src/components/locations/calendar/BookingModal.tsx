import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BookingForm } from "./BookingForm";
import { BookingSummary } from "./BookingSummary";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export type BookingModalMode = "view" | "create" | "edit";

interface BookingModalProps {
  mode: BookingModalMode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingId: string | null;
  locationId: string;
  initialDate?: string;
  // We can pass data if we have it, or let the modal fetch it if in view/edit mode
  // The wrapper usually handles passing ID.
  // For 'view' and 'edit' we need to fetch details.
  // BookingSummary fetches details? No, it takes `booking` prop.
  // We should fetch here or in wrapper.
  // Wrapper fetches list. Detail is fetched by ID.
  // Let's use `useBooking` here for detail if ID is present.
}

import { useBooking, useDeleteBookingMutation } from "@/lib/queries/bookings";
import { Skeleton } from "@/components/ui/skeleton";

export function BookingModal({
  mode: initialMode,
  open,
  onOpenChange,
  bookingId,
  locationId,
  initialDate,
}: BookingModalProps) {
  const [internalMode, setInternalMode] = useState<BookingModalMode>(initialMode);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset internal mode when prop mode changes (e.g. reopening)
  React.useEffect(() => {
    if (open) {
      setInternalMode(initialMode);
    }
  }, [open, initialMode]);

  const { data: booking, isLoading } = useBooking(bookingId);
  const deleteBookingMutation = useDeleteBookingMutation();

  const handleEditClick = () => {
    setInternalMode("edit");
  };

  const handleDeleteClick = () => {
    setIsDeleting(true);
  };

  const handleDeleteConfirm = async () => {
    if (!bookingId) return;

    try {
      await deleteBookingMutation.mutateAsync(bookingId);
      setIsDeleting(false);
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting booking:", error);
      alert("Wystąpił błąd podczas usuwania rezerwacji");
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSuccess = () => {
    onOpenChange(false);
  };

  const getTitle = () => {
    switch (internalMode) {
      case "create":
        return "Nowa Rezerwacja";
      case "edit":
        return "Edycja Rezerwacji";
      case "view":
        return "Szczegóły Rezerwacji";
      default:
        return "";
    }
  };

  const renderContent = () => {
    if ((internalMode === "view" || internalMode === "edit") && isLoading) {
      return (
        <div className="space-y-4 p-4">
          <Skeleton className="h-4 w-[200px]" />
          <Skeleton className="h-[200px] w-full" />
        </div>
      );
    }

    if ((internalMode === "view" || internalMode === "edit") && !booking && !isLoading) {
      return (
        <div className="p-4 text-center text-muted-foreground">Nie znaleziono rezerwacji.</div>
      );
    }

    if (internalMode === "view" && booking) {
      return (
        <BookingSummary
          booking={booking}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          onClose={handleClose} // BookingSummary needs to support onClose or we just rely on dialog close
        />
      );
    }

    if (internalMode === "create") {
      return (
        <BookingForm
          locationId={locationId}
          mode="create"
          initialDate={initialDate}
          onSuccess={handleSuccess}
          onCancel={handleClose}
        />
      );
    }

    if (internalMode === "edit" && booking) {
      return (
        <BookingForm
          locationId={locationId}
          mode="edit"
          initialData={booking}
          onSuccess={handleSuccess}
          onCancel={handleClose}
        />
      );
    }

    return null;
  };

  const renderDeleteDialog = () => (
    <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Czy na pewno chcesz usunąć tę rezerwację?</AlertDialogTitle>
          <AlertDialogDescription>
            Ta operacja jest nieodwracalna. Rezerwacja zostanie całkowicie usunięta z systemu.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Anuluj</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
            Usuń
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{getTitle()}</DialogTitle>
          </DialogHeader>
          {renderContent()}
        </DialogContent>
      </Dialog>
      {renderDeleteDialog()}
    </>
  );
}
