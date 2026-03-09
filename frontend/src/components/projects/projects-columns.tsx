import type { ColumnDef } from "@tanstack/react-table";
import { format, parseISO } from "date-fns";
import type { Project } from "@/hooks/use-projects";
import { DataTableColumnHeader } from "@/components/shared/data-table-column-header";
import { StatusBadge } from "@/components/shared/status-badge";

export const projectsColumns: ColumnDef<Project, unknown>[] = [
  {
    accessorKey: "key",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Key" />
    ),
    cell: ({ row }) => (
      <span className="font-mono text-sm font-semibold">
        {row.getValue("key")}
      </span>
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
  },
  {
    accessorKey: "bfm",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="BFM" />
    ),
  },
  {
    accessorKey: "pm",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="PM" />
    ),
  },
  {
    accessorKey: "admin",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Admin" />
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("created_at") as string;
      return date ? (
        <span className="text-muted-foreground">
          {format(parseISO(date), "MMM d, yyyy")}
        </span>
      ) : (
        "-"
      );
    },
  },
];
