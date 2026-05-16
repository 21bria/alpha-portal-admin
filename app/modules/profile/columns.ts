import type { ColumnDef } from "@tanstack/vue-table"
import { h } from "vue"
import { Checkbox } from "@/components/ui/checkbox"
import DataTableColumnHeader from "@/components/data-table/DataTableColumnHeader.vue"
import DataTableRowActions from "./components/DataTableRowActions.vue"
import type { UserRole } from "@/utils/roles"

export type CompanyProfileRow = {
  id: number
  company_name: string
  legal_name?: string | null
  tagline?: string | null
  primary_logo_url?: string | null
  white_logo_url?: string | null
  favicon_url?: string | null
  address?: string | null
  phone?: string | null
  email?: string | null
  updated_at?: string | null
}

type ColumnActions = {
  onEdit: (row: CompanyProfileRow) => void
  onDelete: (row: CompanyProfileRow) => void
}

type CheckState = boolean | "indeterminate"

type ColumnOptions = {
  role?: UserRole
}

export function getCompanyProfileColumns(
  actions: ColumnActions,
  opts: ColumnOptions = {}
): ColumnDef<CompanyProfileRow>[] {
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
      accessorKey: "company_name",
      header: ({ column }) =>
        h(DataTableColumnHeader, { column, title: "Company Name" }),
      enableSorting: true,
      cell: ({ row }) =>
        h("div", { class: "font-medium" }, row.original.company_name ?? "-"),
    },
    {
      accessorKey: "legal_name",
      header: ({ column }) =>
        h(DataTableColumnHeader, { column, title: "Legal Name" }),
      enableSorting: true,
      cell: ({ row }) =>
        h("div", { class: "text-muted-foreground" }, row.original.legal_name ?? "-"),
    },
    {
      accessorKey: "tagline",
      header: ({ column }) =>
        h(DataTableColumnHeader, { column, title: "Tagline" }),
      enableSorting: false,
      cell: ({ row }) =>
        h(
          "div",
          { class: "max-w-[320px] truncate text-muted-foreground" },
          row.original.tagline ?? "-"
        ),
    },
    {
      accessorKey: "primary_logo_url",
      header: ({ column }) =>
        h(DataTableColumnHeader, { column, title: "Primary Logo" }),
      enableSorting: false,
      cell: ({ row }) =>
        row.original.primary_logo_url
          ? h("img", {
              src: row.original.primary_logo_url,
              alt: row.original.company_name,
              class: "h-9 w-9 rounded-md object-contain border bg-white",
            })
          : h("div", { class: "text-muted-foreground" }, "-"),
    },
    {
      accessorKey: "email",
      header: ({ column }) =>
        h(DataTableColumnHeader, { column, title: "Email" }),
      enableSorting: true,
      cell: ({ row }) =>
        h("div", { class: "text-muted-foreground" }, row.original.email ?? "-"),
    },
    {
      accessorKey: "phone",
      header: ({ column }) =>
        h(DataTableColumnHeader, { column, title: "Phone" }),
      enableSorting: false,
      cell: ({ row }) =>
        h("div", { class: "text-muted-foreground" }, row.original.phone ?? "-"),
    },
    {
      accessorKey: "updated_at",
      header: ({ column }) =>
        h(DataTableColumnHeader, { column, title: "Updated At" }),
      enableSorting: true,
      cell: ({ row }) =>
        h("div", { class: "text-muted-foreground" }, row.original.updated_at ?? "-"),
    },
    ...(canMutate
      ? [
          {
            id: "actions",
            header: () => h("div", { class: "text-left" }, "Actions"),
            cell: ({ row }: { row: { original: CompanyProfileRow } }) =>
              h("div", { class: "flex justify-end" }, [
                h(DataTableRowActions, {
                  row: row.original,
                  onEdit: actions.onEdit,
                  onDelete: actions.onDelete,
                }),
              ]),
          } as ColumnDef<CompanyProfileRow>,
        ]
      : []),
  ]
}