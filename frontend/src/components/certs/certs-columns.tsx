import type { ColumnDef } from "@tanstack/react-table";
import { formatDistanceToNow, parseISO } from "date-fns";
import { MoreHorizontal, Pencil, Trash2, Download } from "lucide-react";
import type { Cert } from "@/hooks/use-certs";
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

interface CertColumnsOptions {
  onEdit: (cert: Cert) => void;
  onDelete: (cert: Cert) => void;
  onExport: (cert: Cert) => void;
}

export function getCertsColumns(
  opts: CertColumnsOptions
): ColumnDef<Cert, unknown>[] {
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
      accessorKey: "common_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Common Name" />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs">
          {row.getValue("common_name") || "-"}
        </span>
      ),
    },
    {
      accessorKey: "issuer",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Issuer" />
      ),
    },
    {
      accessorKey: "cert_type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
    },
    {
      accessorKey: "not_valid_after",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Expires" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("not_valid_after") as string | null;
        if (!date) return <span className="text-muted-foreground">-</span>;
        return (
          <span className="text-sm">
            {formatDistanceToNow(parseISO(date), { addSuffix: true })}
          </span>
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
        const cert = row.original;
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
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  opts.onExport(cert);
                }}
              >
                <Download className="size-4" />
                Export
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  opts.onEdit(cert);
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
                  opts.onDelete(cert);
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
