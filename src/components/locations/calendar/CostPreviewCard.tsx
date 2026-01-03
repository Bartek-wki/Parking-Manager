import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Calculator } from "lucide-react";
import type { PreviewBookingResponse } from "@/types";

interface CostPreviewCardProps {
  isLoading: boolean;
  error: Error | null;
  data: PreviewBookingResponse | undefined;
}

export function CostPreviewCard({ isLoading, error, data }: CostPreviewCardProps) {
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Kalkulacja Kosztów</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[80%]" />
            <Skeleton className="h-10 w-full mt-4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || (data && !data.available)) {
    return (
      <div className="rounded-md border border-destructive/50 p-4 text-destructive [&>svg]:text-destructive bg-destructive/10">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <h5 className="font-medium leading-none tracking-tight">Niedostępne</h5>
        </div>
        <div className="mt-2 text-sm [&_p]:leading-relaxed">{error?.message}</div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          Podsumowanie Kosztów
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-baseline">
          <span className="text-sm text-muted-foreground">Całkowity koszt:</span>
          <span className="text-2xl font-bold">{data.total_cost.toFixed(2)} PLN</span>
        </div>

        {data.calculation_details.length > 0 && (
          <div className="text-xs text-muted-foreground space-y-1 bg-muted p-2 rounded-md max-h-32 overflow-y-auto">
            {data.calculation_details.map((detail, index) => (
              <div key={index} className="flex justify-between">
                <span>{detail.date}</span>
                <div className="flex gap-2">
                  {detail.exception && (
                    <span className="text-amber-600 font-medium">({detail.exception})</span>
                  )}
                  <span>{detail.rate.toFixed(2)} zł</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
