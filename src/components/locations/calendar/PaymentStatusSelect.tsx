import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "./StatusBadge";
import type { PaymentStatus } from "@/types";

interface PaymentStatusSelectProps {
  value: PaymentStatus;
  onChange: (value: PaymentStatus) => void;
}

export function PaymentStatusSelect({ value, onChange }: PaymentStatusSelectProps) {
  const statuses: PaymentStatus[] = ["nieoplacone", "oplacone"];

  return (
    <Select value={value} onValueChange={(v) => onChange(v as PaymentStatus)}>
      <SelectTrigger>
        <SelectValue>
          <div className="flex items-center">
            <StatusBadge status={value} />
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {statuses.map((status) => (
          <SelectItem key={status} value={status}>
            <StatusBadge status={status} />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
