import React from "react";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ReservationType } from "@/types";

interface BookingTypeToggleProps {
  value: ReservationType;
  onChange: (value: ReservationType) => void;
}

export function BookingTypeToggle({ value, onChange }: BookingTypeToggleProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as ReservationType)} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="periodic">Okresowa</TabsTrigger>
        <TabsTrigger value="permanent">Stała</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
