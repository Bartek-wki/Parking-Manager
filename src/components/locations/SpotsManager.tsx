import { useState, useMemo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useSpots, useCreateSpotMutation, useUpdateSpotMutation } from "@/lib/queries/spots";
import { SpotsTable } from "./spots/SpotsTable";
import { SpotDialog } from "./spots/SpotDialog";
import type { CreateSpotCmd, SpotDTO } from "@/types";
import { toast } from "sonner";

interface SpotsManagerProps {
  locationId: string;
}

export function SpotsManager({ locationId }: SpotsManagerProps) {
  const { data: spots = [], isLoading } = useSpots(locationId);
  const createMutation = useCreateSpotMutation(locationId);
  const updateMutation = useUpdateSpotMutation(locationId);

  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSpot, setEditingSpot] = useState<SpotDTO | null>(null);

  // Filter spots
  const filteredSpots = useMemo(() => {
    if (!searchTerm) return spots;
    const lowerTerm = searchTerm.toLowerCase();
    return spots.filter((spot) => spot.spot_number.toLowerCase().includes(lowerTerm));
  }, [spots, searchTerm]);

  const handleCreate = useCallback(
    async (data: CreateSpotCmd) => {
      try {
        await createMutation.mutateAsync(data);
        toast.success("Miejsce zostało dodane.");
      } catch (error) {
        // Error handling is partly in Dialog (422) but generic error here
        toast.error("Nie udało się dodać miejsca.");
        throw error; // Re-throw for Dialog to handle specific errors if needed
      }
    },
    [createMutation]
  );

  const handleUpdate = useCallback(
    async (data: CreateSpotCmd) => {
      if (!editingSpot) return;
      try {
        await updateMutation.mutateAsync({
          spotId: editingSpot.id,
          data: { spot_number: data.spot_number },
        });
        toast.success("Miejsce zostało zaktualizowane.");
        setEditingSpot(null);
      } catch (error) {
        toast.error("Nie udało się zaktualizować miejsca.");
        throw error;
      }
    },
    [editingSpot, updateMutation]
  );

  const handleToggleStatus = useCallback(
    async (spot: SpotDTO, isActive: boolean) => {
      try {
        await updateMutation.mutateAsync({
          spotId: spot.id,
          data: { is_active: isActive },
        });
        toast.success(`Miejsce ${isActive ? "aktywowane" : "dezaktywowane"}.`);
      } catch {
        toast.error("Nie udało się zmienić statusu miejsca.");
      }
    },
    [updateMutation]
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Miejsca parkingowe</CardTitle>
            <CardDescription>Zarządzaj miejscami parkingowymi dla tej lokalizacji.</CardDescription>
          </div>
          <Button onClick={() => setIsCreateOpen(true)} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Dodaj miejsce
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Szukaj miejsca..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />
        </div>

        <SpotsTable
          data={filteredSpots}
          isLoading={isLoading}
          onEdit={setEditingSpot}
          onToggleStatus={handleToggleStatus}
        />

        <SpotDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          onSubmit={handleCreate}
          title="Dodaj miejsce"
          description="Wprowadź numer nowego miejsca parkingowego."
          submitLabel="Dodaj"
        />

        <SpotDialog
          open={!!editingSpot}
          onOpenChange={(open) => !open && setEditingSpot(null)}
          onSubmit={handleUpdate}
          defaultValues={editingSpot ? { spot_number: editingSpot.spot_number } : undefined}
          title="Edytuj miejsce"
          description="Zmień numer miejsca parkingowego."
          submitLabel="Zapisz"
        />
      </CardContent>
    </Card>
  );
}
