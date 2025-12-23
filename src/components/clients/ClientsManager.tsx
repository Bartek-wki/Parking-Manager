import { useState } from "react";
import type { ClientDTO } from "@/types";
import { ClientsHeader } from "./ClientsHeader";
import { ClientsList } from "./ClientsList";
import { ClientSheet } from "./ClientSheet";
import { withQueryClient } from "@/lib/query-client";

function ClientsManagerBase() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientDTO | null>(null);

  const handleAddClick = () => {
    setEditingClient(null);
    setIsSheetOpen(true);
  };

  const handleEditClick = (client: ClientDTO) => {
    setEditingClient(client);
    setIsSheetOpen(true);
  };

  const handleOpenChange = (open: boolean) => {
    setIsSheetOpen(open);
    if (!open) {
      // Clear editing client after animation allows for smooth transition
      // The Sheet duration is usually 300ms-500ms.
      setTimeout(() => setEditingClient(null), 300);
    }
  };

  return (
    <div className="space-y-8">
      <ClientsHeader onAddClick={handleAddClick} />
      <ClientsList onEdit={handleEditClick} onAddClick={handleAddClick} />
      <ClientSheet open={isSheetOpen} onOpenChange={handleOpenChange} client={editingClient} />
    </div>
  );
}

export const ClientsManager = withQueryClient(ClientsManagerBase);
