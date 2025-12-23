import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ClientForm } from "./ClientForm";
import type { ClientDTO } from "@/types";

interface ClientSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: ClientDTO | null;
}

export function ClientSheet({ open, onOpenChange, client }: ClientSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{client ? "Edytuj klienta" : "Dodaj klienta"}</SheetTitle>
          <SheetDescription>
            {client
              ? "Zmień dane klienta poniżej."
              : "Wypełnij formularz, aby dodać nowego klienta."}
          </SheetDescription>
        </SheetHeader>
        <div className="p-4 ">
          <ClientForm
            defaultValues={client || undefined}
            clientId={client?.id}
            onSuccess={() => onOpenChange(false)}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
