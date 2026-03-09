import type { ColumnDef } from "@tanstack/react-table";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { Download, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import type { License } from "@/hooks/use-licenses";
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LicenseColumnsOptions {
  onEdit: (license: License) => void;
  onDelete: (license: License) => void;
  onDownload: (license: License) => void;
}

export function getLicensesColumns(
  opts: LicenseColumnsOptions
): ColumnDef<License, unknown>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("name")}</span>
      ),
    },
    {
      accessorKey: "product",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Product" />
      ),
    },
    {
      accessorKey: "vendor",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Vendor" />
      ),
    },
    {
      accessorKey: "license_type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
    },
    {
      accessorKey: "seat_count",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Seats" />
      ),
      cell: ({ row }) => {
        const seats = row.getValue("seat_count") as number | null;
        return seats != null ? seats : "-";
      },
    },
    {
      accessorKey: "expiration_date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Expiration" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("expiration_date") as string | null;
        if (!date) return <span className="text-muted-foreground">Perpetual</span>;
        const parsed = parseISO(date);
        return (
          <div>
            <p className="text-sm">
              {formatDistanceToNow(parsed, { addSuffix: true })}
            </p>
            <p className="text-xs text-muted-foreground">
              {format(parsed, "MMM d, yyyy")}
            </p>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const license = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="ghost" size="icon-xs" />
              }
            >
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Actions</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {license.file_name && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    opts.onDownload(license);
                  }}
                >
                  <Download className="size-4" />
                  Download
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  opts.onEdit(license);
                }}
              >
                <Pencil className="size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  opts.onDelete(license);
                }}
              >
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
