import type { ColumnDef } from "@tanstack/vue-table"
import { h } from "vue"

import { Checkbox } from "@/components/ui/checkbox"
import DataTableColumnHeader from "@/components/data-table/DataTableColumnHeader.vue"
import DataTableRowActions from "./components/DataTableRowActions.vue"

import type { UserRole } from "@/utils/roles"
import { formatDate } from "@/utils/formatDate"

export type TaskRow = {
  id: number
  code: string
  title: string
  slug: string

  description?: string | null
  location?: string | null
  department?: string | null

  status: "backlog" | "todo" | "in_progress" | "done" | "canceled"
  priority: "low" | "medium" | "high" | "urgent"

  assigned_to?: string | null

  start_date?: string | null
  due_date?: string | null

  checklist?: any[]
  attachments?: any[]

  is_public?: boolean

  created_at?: string | null
  updated_at?: string | null
}

type ColumnActions = {
  onEdit: (row: TaskRow) => void
  onDelete: (row: TaskRow) => void
}

type CheckState = boolean | "indeterminate"

type ColumnOptions = {
  role?: UserRole
}

function statusClass(status: TaskRow["status"]) {
  if (status === "done") {
    return "inline-flex rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600"
  }

  if (status === "in_progress") {
    return "inline-flex rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600"
  }

  if (status === "canceled") {
    return "inline-flex rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-600"
  }

  if (status === "backlog") {
    return "inline-flex rounded-full bg-zinc-500/10 px-2 py-0.5 text-xs font-medium text-zinc-600"
  }

  return "inline-flex rounded-full bg-cyan-500/10 px-2 py-0.5 text-xs font-medium text-cyan-600"
}

function priorityClass(priority: TaskRow["priority"]) {
  if (priority === "urgent") {
    return "inline-flex rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-600"
  }

  if (priority === "high") {
    return "inline-flex rounded-full bg-orange-500/10 px-2 py-0.5 text-xs font-medium text-orange-600"
  }

  if (priority === "low") {
    return "inline-flex rounded-full bg-zinc-500/10 px-2 py-0.5 text-xs font-medium text-zinc-600"
  }

  return "inline-flex rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-600"
}

function labelize(value?: string | null) {
  if (!value) return "-"

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export function getTaskColumns(
  actions: ColumnActions,
  opts: ColumnOptions = {}
): ColumnDef<TaskRow>[] {
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
      accessorKey: "code",
      header: ({ column }) =>
        h(DataTableColumnHeader, { column, title: "Task" }),
      enableSorting: true,
      cell: ({ row }) =>
        h("div", { class: "font-medium text-muted-foreground" }, row.original.code ?? "-"),
    },

    {
      accessorKey: "title",
      header: ({ column }) =>
        h(DataTableColumnHeader, { column, title: "Title" }),
      enableSorting: true,
      cell: ({ row }) =>
        h("div", { class: "max-w-[420px]" }, [
          h("div", { class: "truncate font-medium" }, row.original.title ?? "-"),
          row.original.description
            ? h(
                "div",
                { class: "mt-1 truncate text-xs text-muted-foreground" },
                row.original.description
              )
            : null,
        ]),
    },

    {
      accessorKey: "department",
      header: ({ column }) =>
        h(DataTableColumnHeader, { column, title: "Department" }),
      enableSorting: true,
      cell: ({ row }) =>
        h("div", { class: "text-muted-foreground" }, row.original.department ?? "-"),
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
      accessorKey: "status",
      header: ({ column }) =>
        h(DataTableColumnHeader, { column, title: "Status" }),
      enableSorting: true,
      cell: ({ row }) =>
        h(
          "span",
          { class: statusClass(row.original.status) },
          labelize(row.original.status)
        ),
    },

    {
      accessorKey: "priority",
      header: ({ column }) =>
        h(DataTableColumnHeader, { column, title: "Priority" }),
      enableSorting: true,
      cell: ({ row }) =>
        h(
          "span",
          { class: priorityClass(row.original.priority) },
          labelize(row.original.priority)
        ),
    },

    {
      accessorKey: "assigned_to",
      header: ({ column }) =>
        h(DataTableColumnHeader, { column, title: "Assigned To" }),
      enableSorting: true,
      cell: ({ row }) =>
        h("div", { class: "text-muted-foreground" }, row.original.assigned_to ?? "-"),
    },

    {
      accessorKey: "due_date",
      header: ({ column }) =>
        h(DataTableColumnHeader, { column, title: "Due Date" }),
      enableSorting: true,
      cell: ({ row }) =>
        h(
          "div",
          { class: "whitespace-nowrap text-muted-foreground" },
          formatDate(row.original.due_date)
        ),
    },

    ...(canMutate
      ? [
          {
            id: "actions",
            header: () => h("div", { class: "text-left" }, "Actions"),
            cell: ({ row }: { row: { original: TaskRow } }) =>
              h("div", { class: "flex justify-end" }, [
                h(DataTableRowActions, {
                  row: row.original,
                  onEdit: actions.onEdit,
                  onDelete: actions.onDelete,
                }),
              ]),
          } as ColumnDef<TaskRow>,
        ]
      : []),
  ]
}