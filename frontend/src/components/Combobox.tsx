import * as React from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { capitalizeWords, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ComboboxProps {
  label?: string;
  placeholder?: string;
  options: { value: string; label: string }[];
  selected: string;
  setSelected: (value: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  emptyMessage?: string
}

export function Combobox({
  label,
  placeholder = "Select an option...",
  options = [],
  selected,
  setSelected,
  isLoading = false,
  disabled = false, // Default to false
  emptyMessage = "No option found."
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={isLoading || disabled} // Combine loading and disabled states
            className="w-full justify-between"
          >
            {isLoading ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : selected ? (
              options.find((option) => option.value === selected)?.label
            ) : (
              placeholder
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search..." />
            <CommandList>
              <CommandEmpty className="text-sm text-wrap w-[200px] text-gray-500 px-4 py-2 break-words whitespace-normal">{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={(currentValue) => {
                      setSelected(currentValue === selected ? "" : currentValue);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selected === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {capitalizeWords(option.label)}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default Combobox