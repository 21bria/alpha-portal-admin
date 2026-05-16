import type { ColumnDef } from "@tanstack/vue-table"
import { h } from "vue"
import { formatDateTime } from "@/utils/formatDate"
import { Checkbox } from "@/components/ui/checkbox"
import DataTableColumnHeader from "@/components/data-table/DataTableColumnHeader.vue"
import DataTableRowActions from "./components/DataTableRowActions.vue"

import type { UserRole } from "@/utils/roles"

export type JobVacancyRow = {
  id: number
  title: string
  slug: string

  department: string
  location: string
  employment_type: string

  summary?: string | null

  is_open: boolean

  published_at?: string | null
  created_at?: string | null
  updated_at?: string | null
}

type ColumnActions = {
  onEdit: (row: JobVacancyRow) => void
  onDelete: (row: JobVacancyRow) => void
}

type CheckState = boolean | "indeterminate"

type ColumnOptions = {
  role?: UserRole
}

export function getJobVacancyColumns(
  actions: ColumnActions,
  opts: ColumnOptions = {}
): ColumnDef<JobVacancyRow>[] {
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
        h(DataTableColumnHeader, {
          column,
          title: "Position",
        }),

      enableSorting: true,

      cell: ({ row }) =>
        h(
          "div",
          { class: "max-w-[260px]" },
          [
            h(
              "div",
              { class: "font-medium" },
              row.original.title ?? "-"
            ),

            h(
              "div",
              { class: "mt-1 text-xs text-muted-foreground" },
              row.original.slug ?? "-"
            ),
          ]
        ),
    },

    {
      accessorKey: "department",

      header: ({ column }) =>
        h(DataTableColumnHeader, {
          column,
          title: "Department",
        }),

      enableSorting: true,

      cell: ({ row }) =>
        h(
          "div",
          { class: "text-muted-foreground" },
          row.original.department ?? "-"
        ),
    },

    {
      accessorKey: "location",

      header: ({ column }) =>
        h(DataTableColumnHeader, {
          column,
          title: "Location",
        }),

      enableSorting: true,

      cell: ({ row }) =>
        h(
          "div",
          { class: "text-muted-foreground" },
          row.original.location ?? "-"
        ),
    },

    {
      accessorKey: "employment_type",

      header: ({ column }) =>
        h(DataTableColumnHeader, {
          column,
          title: "Type",
        }),

      enableSorting: true,

      cell: ({ row }) =>
        h(
          "span",
          {
            class:
              "inline-flex rounded-full bg-cyan-500/10 px-2 py-0.5 text-xs font-medium text-cyan-600",
          },
          row.original.employment_type ?? "-"
        ),
    },

    {
      accessorKey: "is_open",

      header: ({ column }) =>
        h(DataTableColumnHeader, {
          column,
          title: "Status",
        }),

      enableSorting: true,

      cell: ({ row }) => {
        const open = row.original.is_open

        return h(
          "span",
          {
            class: open
              ? "inline-flex rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600"
              : "inline-flex rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-600",
          },
          open ? "Open" : "Closed"
        )
      },
    },

    {
      accessorKey: "published_at",

      header: ({ column }) =>
        h(DataTableColumnHeader, {
          column,
          title: "Published",
        }),

      enableSorting: true,

     cell: ({ row }) =>
      h(
        "div",
        { class: "text-muted-foreground whitespace-nowrap" },
        formatDateTime(row.original.published_at)
      ),
    },

    ...(canMutate
      ? [
          {
            id: "actions",

            header: () =>
              h(
                "div",
                { class: "text-left" },
                "Actions"
              ),

            cell: ({ row }: { row: { original: JobVacancyRow } }) =>
              h(
                "div",
                { class: "flex justify-end" },
                [
                  h(DataTableRowActions, {
                    row: row.original,
                    onEdit: actions.onEdit,
                    onDelete: actions.onDelete,
                  }),
                ]
              ),
          } as ColumnDef<JobVacancyRow>,
        ]
      : []),
  ]
}