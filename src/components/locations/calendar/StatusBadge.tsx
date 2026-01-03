import React from "react";
import { cn } from "@/lib/utils";
import type { PaymentStatus, ReservationStatus } from "@/types";

interface StatusBadgeProps {
  status: PaymentStatus | ReservationStatus | string; // Allow string for flexibility but prefer types
  variant?: "default" | "outline";
  className?: string;
}

export function StatusBadge({ status, variant = "default", className }: StatusBadgeProps) {
  const getStatusColor = (s: string) => {
    switch (s) {
      // Reservation Statuses
      case "aktywna":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800";
      case "zakonczona":
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
      case "anulowana":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";

      // Payment Statuses
      case "oplacone":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800";
      case "nieoplacone":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
    }
  };

  const formatStatus = (s: string) => {
    return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        getStatusColor(status),
        className
      )}
    >
      {formatStatus(status)}
    </span>
  );
}
