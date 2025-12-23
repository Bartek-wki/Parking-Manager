import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ClientsHeaderProps {
  onAddClick: () => void;
}

export function ClientsHeader({ onAddClick }: ClientsHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Klienci</h2>
        <p className="text-muted-foreground">Zarządzaj bazą klientów i ich danymi kontaktowymi.</p>
      </div>
      <Button onClick={onAddClick}>
        <Plus className="mr-2 h-4 w-4" />
        Dodaj klienta
      </Button>
    </div>
  );
}
