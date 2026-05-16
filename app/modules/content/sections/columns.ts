import type { ColumnDef } from "@tanstack/vue-table"
import { h } from "vue"
import { Checkbox } from "@/components/ui/checkbox"
import DataTableColumnHeader from "@/components/data-table/DataTableColumnHeader.vue"
import DataTableRowActions from "./components/DataTableRowActions.vue"
import type { UserRole } from "@/utils/roles"

export type PageSectionRow = {
  id: number
  page: number
  page_detail?: {
    id: number
    title: string
    slug: string
  } | null

  section_type: string
  title?: string | null
  subtitle?: string | null
  content?: string | null

  image?: string | null
  image_url?: string | null
  // image_position: "top" | "bottom" | "left" | "right" | "background"
  image_position?: string | null

  data?: Record<string, any> | null
  sort_order: number
  is_active: boolean

  created_at?: string | null
  updated_at?: string | null
}

type ColumnActions = {
  onEdit: (row: PageSectionRow) => void
  onDelete: (row: PageSectionRow) => void
}

type CheckState = boolean | "indeterminate"

type ColumnOptions = {
  role?: UserRole
}

export function getPageSectionColumns(
  actions: ColumnActions,
  opts: ColumnOptions = {}
): ColumnDef<PageSectionRow>[] {
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
      accessorKey: "image_url",
      header: ({ column }) =>
        h(DataTableColumnHeader, { column, title: "Image" }),
      enableSorting: false,
      cell: ({ row }) => {
        const src = row.original.image_url

        if (!src) {
          return h(
            "div",
            {
              class:
                "flex h-16 w-24 items-center justify-center rounded-md border bg-muted text-xs text-muted-foreground",
            },
            "No image"
          )
        }

        return h("img", {
          src,
          alt: row.original.title ?? "Section image",
          class: "h-16 w-24 rounded-md border object-cover shadow-sm",
        })
      },
    },

    {
      accessorKey: "page_detail.title",
      header: ({ column }) =>
        h(DataTableColumnHeader, { column, title: "Page" }),
      enableSorting: true,
      cell: ({ row }) =>
        h(
          "div",
          { class: "font-medium" },
          row.original.page_detail?.title ?? row.original.page ?? "-"
        ),
    },

    {
      accessorKey: "section_type",
      header: ({ column }) =>
        h(DataTableColumnHeader, { column, title: "Type" }),
      enableSorting: true,
      cell: ({ row }) =>
        h(
          "span",
          {
            class:
              "inline-flex rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground",
          },
          row.original.section_type
        ),
    },

    {
      accessorKey: "title",
      header: ({ column }) =>
        h(DataTableColumnHeader, { column, title: "Title" }),
      enableSorting: true,
      cell: ({ row }) =>
        h(
          "div",
          { class: "max-w-[260px] truncate font-medium" },
          row.original.title ?? "-"
        ),
    },

    {
      accessorKey: "subtitle",
      header: ({ column }) =>
        h(DataTableColumnHeader, { column, title: "Subtitle" }),
      enableSorting: false,
      cell: ({ row }) =>
        h(
          "div",
          { class: "max-w-[320px] truncate text-muted-foreground" },
          row.original.subtitle ?? "-"
        ),
    },

    {
      accessorKey: "image_position",
      header: ({ column }) =>
        h(DataTableColumnHeader, { column, title: "Image Position" }),
      enableSorting: true,
      cell: ({ row }) =>
        h("div", { class: "text-muted-foreground" }, row.original.image_position ?? "-"),
    },

    {
      accessorKey: "sort_order",
      header: ({ column }) =>
        h(DataTableColumnHeader, { column, title: "Order" }),
      enableSorting: true,
      cell: ({ row }) =>
        h("div", { class: "font-medium" }, String(row.original.sort_order ?? 0)),
    },

    {
      accessorKey: "is_active",
      header: ({ column }) =>
        h(DataTableColumnHeader, { column, title: "Status" }),
      enableSorting: true,
      cell: ({ row }) =>
        h(
          "span",
          {
            class: row.original.is_active
              ? "inline-flex rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600"
              : "inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground",
          },
          row.original.is_active ? "Active" : "Inactive"
        ),
    },

    ...(canMutate
      ? [
          {
            id: "actions",
            header: () => h("div", { class: "text-left" }, "Actions"),
            cell: ({ row }: { row: { original: PageSectionRow } }) =>
              h("div", { class: "flex justify-end" }, [
                h(DataTableRowActions, {
                  row: row.original,
                  onEdit: actions.onEdit,
                  onDelete: actions.onDelete,
                }),
              ]),
          } as ColumnDef<PageSectionRow>,
        ]
      : []),
  ]
}