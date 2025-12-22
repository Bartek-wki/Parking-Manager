import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LocationForm } from "./LocationForm";
import { useCreateLocationMutation } from "@/lib/queries/locations";
import type { CreateLocationCmd } from "@/types";

interface CreateLocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateLocationDialog({ open, onOpenChange }: CreateLocationDialogProps) {
  const mutation = useCreateLocationMutation();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: CreateLocationCmd) => {
    setError(null);
    try {
      const newLocation = await mutation.mutateAsync(values);
      onOpenChange(false);
      // Save to localStorage
      localStorage.setItem("lastVisitedLocationId", newLocation.id);
      // Redirect to the new location's calendar or settings
      // Using window.location.href for full page reload/navigation as we might need to reset some state
      window.location.href = `/locations/${newLocation.id}/settings`;
    } catch (err) {
      console.error(err);
      setError("Nie udało się utworzyć lokalizacji. Spróbuj ponownie.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Dodaj nowy parking</DialogTitle>
        </DialogHeader>
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <LocationForm onSubmit={handleSubmit} isSubmitting={mutation.isPending} />
      </DialogContent>
    </Dialog>
  );
}
