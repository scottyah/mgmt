import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface DataTableToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  children?: React.ReactNode;
}

export function DataTableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  children,
}: DataTableToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-4 pb-4">
      <div className="relative max-w-sm flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
