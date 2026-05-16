import type { ColumnDef } from "@tanstack/vue-table"
import { h } from "vue"
import { Checkbox } from "@/components/ui/checkbox"
import DataTableColumnHeader from "@/components/data-table/DataTableColumnHeader.vue"
import DataTableRowActions from "./components/DataTableRowActions.vue"
import type { UserRole } from "@/utils/roles"
import { formatDateTime } from "@/utils/formatDate"
export type NewsArticleRow = {
  id: number
  category: number | null
  category_detail?: {
    id: number
    name: string
    slug: string
  } | null

  tags?: number[]
  tags_detail?: {
    id: number
    name: string
    slug: string
  }[]

  title: string
  slug: string
  excerpt?: string | null
  content?: string | null
  cover_image?: string | null
  cover_image_url?: string | null
  author_name?: string | null
  published_at?: string | null
  status: "draft" | "published" | "archived"
  is_featured?: boolean
  seo_title?: string | null
  seo_description?: string | null
  created_at?: string | null
  updated_at?: string | null
}

type ColumnActions = {
  onEdit: (row: NewsArticleRow) => void
  onDelete: (row: NewsArticleRow) => void
}

type CheckState = boolean | "indeterminate"

type ColumnOptions = {
  role?: UserRole
}

export function getNewsArticleColumns(
  actions: ColumnActions,
  opts: ColumnOptions = {}
): ColumnDef<NewsArticleRow>[] {
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
      accessorKey: "cover_image_url",
      header: ({ column }) =>
        h(DataTableColumnHeader, { column, title: "Image" }),
      enableSorting: false,
      cell: ({ row }) => {
        const src = row.original.cover_image_url

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
          alt: row.original.title ?? "Article image",
          class:
            "h-16 w-24 rounded-md border object-cover shadow-sm",
        })
      },
    },
    {
      accessorKey: "title",
      header: ({ column }) =>
        h(DataTableColumnHeader, { column, title: "Title" }),
      enableSorting: true,
      cell: ({ row }) =>
        h("div", { class: "max-w-[260px] truncate font-medium" }, row.original.title ?? "-"),
    },

    {
      accessorKey: "category_detail.name",
      header: ({ column }) =>
        h(DataTableColumnHeader, { column, title: "Category" }),
      enableSorting: true,
      cell: ({ row }) =>
        h("div", { class: "text-muted-foreground" }, row.original.category_detail?.name ?? "-"),
    },
    {
      accessorKey: "tags_detail",
      header: ({ column }) =>
        h(DataTableColumnHeader, { column, title: "Tags" }),
      enableSorting: false,
      cell: ({ row }) => {
        const tags = row.original.tags_detail ?? []

        if (!tags.length) {
          return h("div", { class: "text-muted-foreground" }, "-")
        }

        return h(
          "div",
          { class: "flex max-w-[240px] flex-wrap gap-1" },
          tags.map((tag) =>
            h(
              "span",
              {
                class:
                  "rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground",
              },
              tag.name
            )
          )
        )
      },
    },
    {
      accessorKey: "author_name",
      header: ({ column }) =>
        h(DataTableColumnHeader, { column, title: "Author" }),
      enableSorting: true,
      cell: ({ row }) =>
        h("div", { class: "text-muted-foreground" }, row.original.author_name ?? "-"),
    },

    {
      accessorKey: "status",
      header: ({ column }) =>
        h(DataTableColumnHeader, { column, title: "Status" }),
      enableSorting: true,
      cell: ({ row }) => {
        const status = row.original.status ?? "draft"

        const cls =
          status === "published"
            ? "inline-flex rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600"
            : status === "archived"
              ? "inline-flex rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-600"
              : "inline-flex rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"

        return h("span", { class: cls }, status)
      },
    },
    {
      accessorKey: "published_at",
      header: ({ column }) =>
        h(DataTableColumnHeader, { column, title: "Published At" }),
      enableSorting: true,
      cell: ({ row }) =>
        h(
          "div",
          { class: "text-muted-foreground whitespace-nowrap" },
          formatDateTime(row.original.published_at)
        ),
    },

    {
      accessorKey: "slug",
      header: ({ column }) =>
        h(DataTableColumnHeader, { column, title: "Slug" }),
      enableSorting: true,
      cell: ({ row }) =>
        h("div", { class: "max-w-[220px] truncate text-muted-foreground" }, row.original.slug ?? "-"),
    },

    ...(canMutate
      ? [
        {
          id: "actions",
          header: () => h("div", { class: "text-left" }, "Actions"),
          cell: ({ row }: { row: { original: NewsArticleRow } }) =>
            h("div", { class: "flex justify-end" }, [
              h(DataTableRowActions, {
                row: row.original,
                onEdit: actions.onEdit,
                onDelete: actions.onDelete,
              }),
            ]),
        } as ColumnDef<NewsArticleRow>,
      ]
      : []),
  ]
}