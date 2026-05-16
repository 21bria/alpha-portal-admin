import type { ColumnDef } from "@tanstack/vue-table"
import { h } from "vue"
import { Checkbox } from "@/components/ui/checkbox"
import DataTableColumnHeader from "@/components/data-table/DataTableColumnHeader.vue"
import DataTableRowActions from "./components/DataTableRowActions.vue"
import type { UserRole } from "@/utils/roles"
import { formatDateTime } from "@/utils/formatDate"

export type ProjectRow = {
  id: number
  title: string
  slug: string
  location?: string | null
  province?: string | null
  commodity?: string | null
  status?: string | null
  description?: string | null
  overview?: string | null
  cover_image?: string | null
  cover_image_url?: string | null
  latitude?: string | number | null
  longitude?: string | number | null
  highlights?: unknown[] | null
  is_published: boolean
  sort_order?: number
  created_at?: string | null
  updated_at?: string | null
}

type ColumnActions = {
  onEdit: (row: ProjectRow) => void
  onDelete: (row: ProjectRow) => void
}

type CheckState = boolean | "indeterminate"

type ColumnOptions = {
  role?: UserRole
}

export function getProjectColumns(
  actions: ColumnActions,
  opts: ColumnOptions = {}
): ColumnDef<ProjectRow>[] {
  const role: UserRole = opts.role ?? "ADMIN_USER"
  const canMutate = role !== "GLOBAL_VIEWER"

  return [
    {
      id: "select",
      header: ({ table }) =>
        h(Checkbox, {
          modelValue: table.getIsAllPageRowsSelected(),
          "onUpdate:modelValue": (v: CheckState) =>
            table.toggleAllPageRowsSelected(v === true),
          indeterminate: table.getIsSomePageRowsSelected(),
          onClick: (e: MouseEvent) => e.stopPropagation(),
          "aria-label": "Select all",
        }),
      cell: ({ row }) =>
        h(Checkbox, {
          modelValue: row.getIsSelected(),
          "onUpdate:modelValue": (v: CheckState) =>
            row.toggleSelected(v === true),
          onClick: (e: MouseEvent) => e.stopPropagation(),
          "aria-label": "Select row",
        }),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    {
      accessorKey: "title",
      header: ({ column }) =>
        h(DataTableColumnHeader, { column, title: "Project Title" }),
      enableSorting: true,
      cell: ({ row }) =>
        h("div", { class: "font-medium" }, row.original.title ?? "-"),
    },
    {
      accessorKey: "location",
      header: ({ column }) =>
        h(DataTableColumnHeader, { column, title: "Location" }),
      enableSorting: true,
      cell: ({ row }) =>
        h("div", { class: "text-muted-foreground" }, row.original.location ?? "-"),
    },
    {
      accessorKey: "province",
      header: ({ column }) =>
        h(DataTableColumnHeader, { column, title: "Province" }),
      enableSorting: true,
      cell: ({ row }) =>
        h("div", { class: "text-muted-foreground" }, row.original.province ?? "-"),
    },
    {
      accessorKey: "commodity",
      header: ({ column }) =>
        h(DataTableColumnHeader, { column, title: "Commodity" }),
      enableSorting: true,
      cell: ({ row }) =>
        h("div", { class: "text-muted-foreground" }, row.original.commodity ?? "-"),
    },
    {
      accessorKey: "status",
      header: ({ column }) =>
        h(DataTableColumnHeader, { column, title: "Project Status" }),
      enableSorting: true,
      cell: ({ row }) =>
        h(
          "span",
          {
            class:
              "inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground",
          },
          row.original.status ?? "-"
        ),
    },
    {
      accessorKey: "is_published",
      header: ({ column }) =>
        h(DataTableColumnHeader, { column, title: "Publish" }),
      enableSorting: true,
      cell: ({ row }) =>
        h(
          "span",
          {
            class: row.original.is_published
              ? "inline-flex rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600"
              : "inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground",
          },
          row.original.is_published ? "Published" : "Draft"
        ),
    },
    {
      accessorKey: "description",
      header: ({ column }) =>
        h(DataTableColumnHeader, { column, title: "Description" }),
      enableSorting: false,
      cell: ({ row }) =>
        h(
          "div",
          { class: "max-w-[360px] truncate text-muted-foreground" },
          row.original.description ?? "-"
        ),
    },
    {
      accessorKey: "updated_at",
      header: ({ column }) =>
        h(DataTableColumnHeader, { column, title: "Updated At" }),
      enableSorting: true,
      cell: ({ row }) =>
        h(
          "div",
          { class: "text-muted-foreground whitespace-nowrap" },
          formatDateTime(row.original.updated_at)
        ),
    },
    ...(canMutate
      ? [
          {
            id: "actions",
            header: () => h("div", { class: "text-left" }, "Actions"),
            cell: ({ row }: { row: { original: ProjectRow } }) =>
              h("div", { class: "flex justify-end" }, [
                h(DataTableRowActions, {
                  row: row.original,
                  onEdit: actions.onEdit,
                  onDelete: actions.onDelete,
                }),
              ]),
          } as ColumnDef<ProjectRow>,
        ]
      : []),
  ]
}