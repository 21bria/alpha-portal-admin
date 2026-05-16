import type { ColumnDef } from "@tanstack/vue-table"
import { h } from "vue"
import { Checkbox } from "@/components/ui/checkbox"
import DataTableColumnHeader from "@/components/data-table/DataTableColumnHeader.vue"
import DataTableRowActions from "./components/DataTableRowActions.vue"
import type { UserRole } from "@/utils/roles"
import { formatDateTime } from "@/utils/formatDate"

export type PageRow = {
  id: number
  title: string
  slug: string
  description?: string | null
  is_published: boolean
  seo_title?: string | null
  seo_description?: string | null
  created_at?: string | null
  updated_at?: string | null
}

type ColumnActions = {
  onEdit: (row: PageRow) => void
  onDelete: (row: PageRow) => void
}

type CheckState = boolean | "indeterminate"

type ColumnOptions = {
  role?: UserRole
}

export function getPageColumns(
  actions: ColumnActions,
  opts: ColumnOptions = {}
): ColumnDef<PageRow>[] {
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
        h(DataTableColumnHeader, { column, title: "Page Title" }),
      enableSorting: true,
      cell: ({ row }) =>
        h("div", { class: "font-medium" }, row.original.title ?? "-"),
    },
    {
      accessorKey: "slug",
      header: ({ column }) =>
        h(DataTableColumnHeader, { column, title: "Slug" }),
      enableSorting: true,
      cell: ({ row }) =>
        h("div", { class: "text-muted-foreground" }, row.original.slug ?? "-"),
    },
    {
      accessorKey: "is_published",
      header: ({ column }) =>
        h(DataTableColumnHeader, { column, title: "Status" }),
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
            cell: ({ row }: { row: { original: PageRow } }) =>
              h("div", { class: "flex justify-end" }, [
                h(DataTableRowActions, {
                  row: row.original,
                  onEdit: actions.onEdit,
                  onDelete: actions.onDelete,
                }),
              ]),
          } as ColumnDef<PageRow>,
        ]
      : []),
  ]
}