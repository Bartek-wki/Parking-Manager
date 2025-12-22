import * as React from "react";
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
import { useLocations } from "@/lib/queries/locations";
import { CreateLocationDialog } from "./CreateLocationDialog";
import { withQueryClient } from "@/lib/query-client";

interface LocationSwitcherProps {
  currentLocationId?: string;
}

function LocationSwitcherBase({ currentLocationId }: LocationSwitcherProps) {
  const [open, setOpen] = React.useState(false);
  const [showNewLocationDialog, setShowNewLocationDialog] = React.useState(false);

  const { data: locations = [], isLoading, isError } = useLocations();

  const selectedLocation = locations.find((item) => item.id === currentLocationId);

  const handleSelect = (locationId: string) => {
    setOpen(false);
    // Save to localStorage for auto-redirect on homepage
    localStorage.setItem("lastVisitedLocationId", locationId);
    // Navigate to the selected location
    window.location.href = `/locations/${locationId}/settings`;
  };

  return (
    <div className="flex items-center space-x-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[250px] justify-between"
            disabled={isLoading || isError}
          >
            {isLoading
              ? "Ładowanie..."
              : selectedLocation
                ? selectedLocation.name
                : "Wybierz parking..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0">
          <Command>
            <CommandInput placeholder="Szukaj parkingu..." />
            <CommandList>
              <CommandEmpty>Nie znaleziono parkingu.</CommandEmpty>
              <CommandGroup heading="Dostępne parkingi">
                {locations.map((location) => (
                  <CommandItem
                    key={location.id}
                    value={location.name} // Command searches by value label
                    onSelect={() => handleSelect(location.id)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        currentLocationId === location.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {location.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            <CommandSeparator />
            <CommandList>
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    setShowNewLocationDialog(true);
                  }}
                  className="cursor-pointer"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Dodaj parking
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <CreateLocationDialog open={showNewLocationDialog} onOpenChange={setShowNewLocationDialog} />
    </div>
  );
}

export const LocationSwitcher = withQueryClient(LocationSwitcherBase);
