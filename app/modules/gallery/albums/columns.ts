import type { ColumnDef } from "@tanstack/vue-table"
import { h } from "vue"
import { Checkbox } from "@/components/ui/checkbox"
import DataTableColumnHeader from "@/components/data-table/DataTableColumnHeader.vue"
import DataTableRowActions from "./components/DataTableRowActions.vue"
import type { UserRole } from "@/utils/roles"

export type MediaAlbumRow = {
  id: number
  name: string
  slug: string
  description?: string | null
  cover?: number | null
  cover_url?: string | null
  is_public: boolean
  total_items?: number
  created_at?: string
}

type ColumnActions = {
  onEdit: (row: MediaAlbumRow) => void
  onDelete: (row: MediaAlbumRow) => void
}

type CheckState = boolean | "indeterminate"

type ColumnOptions = {
  role?: UserRole
}

export function getMediaAlbumsColumns(
  actions: ColumnActions,
  opts: ColumnOptions = {}
): ColumnDef<MediaAlbumRow>[] {
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
      accessorKey: "name",
      header: ({ column }) =>
        h(DataTableColumnHeader, {
          column,
          title: "Album Name",
        }),
      enableSorting: true,
      cell: ({ row }) =>
        h("div", { class: "font-medium" }, row.original.name ?? "-"),
    },

    {
      accessorKey: "slug",
      header: ({ column }) =>
        h(DataTableColumnHeader, {
          column,
          title: "Slug",
        }),
      enableSorting: true,
      cell: ({ row }) =>
        h(
          "div",
          { class: "text-muted-foreground" },
          row.original.slug ?? "-"
        ),
    },

    {
      accessorKey: "description",
      header: ({ column }) =>
        h(DataTableColumnHeader, {
          column,
          title: "Description",
        }),
      enableSorting: false,
      cell: ({ row }) =>
        h(
          "div",
          {
            class: "max-w-[360px] truncate text-muted-foreground",
          },
          row.original.description ?? "-"
        ),
    },

    {
      accessorKey: "total_items",
      header: ({ column }) =>
        h(DataTableColumnHeader, {
          column,
          title: "Media",
        }),
      enableSorting: true,
      cell: ({ row }) =>
        h(
          "span",
          {
            class:
              "inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground",
          },
          `${row.original.total_items ?? 0} items`
        ),
    },

    {
      accessorKey: "is_public",
      header: ({ column }) =>
        h(DataTableColumnHeader, {
          column,
          title: "Visibility",
        }),
      enableSorting: true,
      cell: ({ row }) =>
        h(
          "span",
          {
            class: row.original.is_public
              ? "inline-flex rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600"
              : "inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground",
          },
          row.original.is_public ? "Public" : "Private"
        ),
    },

    ...(canMutate
      ? [
          {
            id: "actions",
            header: () =>
              h("div", { class: "text-left" }, "Actions"),

            cell: ({ row }: { row: { original: MediaAlbumRow } }) =>
              h("div", { class: "flex justify-end" }, [
                h(DataTableRowActions, {
                  row: row.original,
                  onEdit: actions.onEdit,
                  onDelete: actions.onDelete,
                }),
              ]),
          } as ColumnDef<MediaAlbumRow>,
        ]
      : []),
  ]
}