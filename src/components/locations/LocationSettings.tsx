import { useState } from "react";
import { useLocations, useUpdateLocationMutation } from "@/lib/queries/locations";
import { LocationForm } from "./LocationForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { CreateLocationCmd } from "@/types";
import { withQueryClient } from "@/lib/query-client";

interface LocationSettingsProps {
  locationId: string;
}

function LocationSettingsBase({ locationId }: LocationSettingsProps) {
  const { data: locations, isLoading } = useLocations();
  const updateMutation = useUpdateLocationMutation();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const location = locations?.find((l) => l.id === locationId);

  const handleSubmit = async (values: CreateLocationCmd) => {
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      await updateMutation.mutateAsync({ id: locationId, data: values });
      setSuccessMessage("Ustawienia zostały zaktualizowane.");

      // Clear message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      // console.error(err); // Handled by UI message
      setErrorMessage("Wystąpił błąd podczas zapisywania zmian.");
    }
  };

  if (isLoading) {
    return <div>Ładowanie danych lokalizacji...</div>;
  }

  if (!location) {
    return <div>Nie znaleziono lokalizacji.</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ustawienia parkingu</CardTitle>
        <CardDescription>Edytuj podstawowe informacje o tym parkingu.</CardDescription>
      </CardHeader>
      <CardContent>
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{errorMessage}</div>
        )}
        <LocationForm
          defaultValues={location}
          onSubmit={handleSubmit}
          isSubmitting={updateMutation.isPending}
        />
      </CardContent>
    </Card>
  );
}

export const LocationSettings = withQueryClient(LocationSettingsBase);
