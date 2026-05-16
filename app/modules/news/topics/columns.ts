import type { ColumnDef } from "@tanstack/vue-table"
import { h } from "vue"
import { Checkbox } from "@/components/ui/checkbox"
import DataTableColumnHeader from "@/components/data-table/DataTableColumnHeader.vue"
import DataTableRowActions from "./components/DataTableRowActions.vue"
import type { UserRole } from "@/utils/roles"

type NewsCategoryDetail = {
  id: number
  name: string
  slug: string
} | null

type NewsTagDetail = {
  id: number
  name: string
  slug: string
}

export type NewsTopicRow = {
  id: number
  title: string
  slug: string
  subtitle?: string | null
  category?: number | null
  category_detail?: NewsCategoryDetail
  tags?: number[]
  tags_detail?: NewsTagDetail[]
  cover_image?: string | null
  cover_image_url?: string | null
  is_active: boolean
  sort_order?: number
}

type ColumnActions = {
  onEdit: (row: NewsTopicRow) => void
  onDelete: (row: NewsTopicRow) => void
}

type CheckState = boolean | "indeterminate"

type ColumnOptions = {
  role?: UserRole
}

export function getNewsTopicsColumns(
  actions: ColumnActions,
  opts: ColumnOptions = {}
): ColumnDef<NewsTopicRow>[] {
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
        h(DataTableColumnHeader, { column, title: "Topic Title" }),
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
      accessorKey: "category_detail",
      header: ({ column }) =>
        h(DataTableColumnHeader, { column, title: "Category" }),
      enableSorting: false,
      cell: ({ row }) =>
        h(
          "span",
          {
            class:
              "inline-flex rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600",
          },
          row.original.category_detail?.name ?? "-"
        ),
    },
    {
      accessorKey: "tags_detail",
      header: ({ column }) =>
        h(DataTableColumnHeader, { column, title: "Tags" }),
      enableSorting: false,
      cell: ({ row }) => {
        const tags = row.original.tags_detail || []

        if (!tags.length) {
          return h("div", { class: "text-muted-foreground" }, "-")
        }

        return h(
          "div",
          { class: "flex max-w-[320px] flex-wrap gap-1" },
          tags.slice(0, 3).map((tag) =>
            h(
              "span",
              {
                class:
                  "inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground",
              },
              tag.name
            )
          )
        )
      },
    },
    {
      accessorKey: "subtitle",
      header: ({ column }) =>
        h(DataTableColumnHeader, { column, title: "Subtitle" }),
      enableSorting: false,
      cell: ({ row }) =>
        h(
          "div",
          { class: "max-w-[360px] truncate text-muted-foreground" },
          row.original.subtitle ?? "-"
        ),
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
    {
      accessorKey: "sort_order",
      header: ({ column }) =>
        h(DataTableColumnHeader, { column, title: "Sort" }),
      enableSorting: true,
      cell: ({ row }) =>
        h("div", { class: "text-muted-foreground" }, row.original.sort_order ?? 0),
    },
    ...(canMutate
      ? [
          {
            id: "actions",
            header: () => h("div", { class: "text-left" }, "Actions"),
            cell: ({ row }: { row: { original: NewsTopicRow } }) =>
              h("div", { class: "flex justify-end" }, [
                h(DataTableRowActions, {
                  row: row.original,
                  onEdit: actions.onEdit,
                  onDelete: actions.onDelete,
                }),
              ]),
          } as ColumnDef<NewsTopicRow>,
        ]
      : []),
  ]
}