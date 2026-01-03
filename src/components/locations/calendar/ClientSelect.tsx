import React, { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useClients } from "@/lib/queries/clients";
import { CreateClientDialog } from "./CreateClientDialog";

interface ClientSelectProps {
  value: string | undefined;
  onChange: (value: string) => void;
  error?: boolean;
}

export function ClientSelect({ value, onChange, error }: ClientSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Use debounced search ideally, but for now direct is okay or internal debounce
  const { data: clients, isLoading } = useClients(search);

  const selectedClient = clients?.find((client) => client.id === value);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between",
              !value && "text-muted-foreground",
              error && "border-destructive"
            )}
          >
            {selectedClient
              ? `${selectedClient.first_name} ${selectedClient.last_name}`
              : "Wybierz klienta..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command shouldFilter={false}>
            {/* We handle filtering via API search, so disable local filtering or keep it if API returns all */}
            {/* If API filters, we should disable local filter. 
                However, useClients(search) implies API search.
                But Command usually expects local items. 
                If we use API search, we update `search` state on input.
            */}
            <CommandInput
              placeholder="Szukaj klienta..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              {isLoading ? (
                <div className="py-6 text-center text-sm">Ładowanie...</div>
              ) : (
                <>
                  <CommandEmpty>Nie znaleziono klienta.</CommandEmpty>
                  <CommandGroup>
                    {clients?.map((client) => (
                      <CommandItem
                        key={client.id}
                        value={client.id} // value for command item
                        keywords={[
                          client.first_name || "",
                          client.last_name || "",
                          client.email || "",
                        ]}
                        onSelect={() => {
                          onChange(client.id);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === client.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col">
                          <span>
                            {client.first_name} {client.last_name}
                          </span>
                          <span className="text-xs text-muted-foreground">{client.email}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
              <CommandSeparator />
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setCreateDialogOpen(true);
                    setOpen(false); // Close the popover
                  }}
                  className="cursor-pointer"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Dodaj nowego klienta
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <CreateClientDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onClientCreated={(newClientId) => {
          onChange(newClientId);
          // Optionally clear search or refetch specific client
        }}
      />
    </>
  );
}
