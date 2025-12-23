import { useState, useEffect } from "react";
import { useLocations, useUpdateLocationMutation } from "@/lib/queries/locations";
import { LocationForm } from "./LocationForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CreateLocationCmd } from "@/types";
import { withQueryClient } from "@/lib/query-client";
import { SpotsManager } from "./SpotsManager";
import { PricingExceptionsManager } from "./PricingExceptionsManager";

interface LocationSettingsProps {
  locationId: string;
}

function LocationSettingsBase({ locationId }: LocationSettingsProps) {
  const { data: locations } = useLocations();
  const updateMutation = useUpdateLocationMutation();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const location = locations?.find((l) => l.id === locationId);

  const handleSubmit = async (values: CreateLocationCmd) => {
    setSuccessMessage(null);
    setErrorMessage(null);
    try {
      await updateMutation.mutateAsync({ id: locationId, data: values });
      setSuccessMessage("Ustawienia zostały zaktualizowane.");

      // Clear message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch {
      // console.error(err); // Handled by UI message
      setErrorMessage("Wystąpił błąd podczas zapisywania zmian.");
    }
  };

  // Don't show loading state during SSR to avoid hydration mismatches

  if (!isClient || !location) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Ustawienia parkingu</h2>
          <p className="text-muted-foreground">Ładowanie danych...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Ustawienia: {location.name}</h2>
        <p className="text-muted-foreground">
          Zarządzaj ustawieniami, miejscami i cennikiem parkingu.
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">Ogólne</TabsTrigger>
          <TabsTrigger value="spots">Miejsca</TabsTrigger>
          <TabsTrigger value="pricing">Cennik</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Dane podstawowe</CardTitle>
              <CardDescription>Edytuj podstawowe informacje o tym parkingu.</CardDescription>
            </CardHeader>
            <CardContent>
              {successMessage && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm">
                  {successMessage}
                </div>
              )}
              {errorMessage && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                  {errorMessage}
                </div>
              )}
              <LocationForm
                defaultValues={location}
                onSubmit={handleSubmit}
                isSubmitting={updateMutation.isPending}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="spots">
          <SpotsManager locationId={locationId} />
        </TabsContent>

        <TabsContent value="pricing">
          <PricingExceptionsManager locationId={locationId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export const LocationSettings = withQueryClient(LocationSettingsBase);
