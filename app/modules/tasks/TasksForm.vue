<script setup lang="ts">
import { ref, computed, watchEffect } from "vue"
import { useDebounceFn } from "@vueuse/core"
import { useAsyncData } from "#app"

import DataTableMaster from "@/components/data-table/DataTableMaster.vue"
import ConfirmDelete from "@/components/ui/confirm-delete.vue"

import { useNotify } from "@/composables/useNotify"
import { useApi } from "@/composables/useApi"
import { useAuthStore } from "@/stores/auth"

import DialogForm, {
  type TaskPayload,
} from "@/modules/tasks/components/DialogForm.vue"

import {
  getTaskColumns,
  type TaskRow,
} from "@/modules/tasks/columns"

import { tasksConfig } from "@/modules/tasks/table"
import { tasksFilters } from "@/modules/tasks/filters"

const { request } = useApi()
const notify = useNotify()
const auth = useAuthStore()

type ApiList<T> = {
  count: number
  results: T[]
}

const role = computed(() => (auth.user?.role ?? "ADMIN_USER") as any)
const canMutate = computed(() => role.value !== "GLOBAL_VIEWER")

const rows = ref<TaskRow[]>([])
const total = ref(0)
const totalPages = ref(1)

const page = ref(1)
const pageSize = ref(10)
const search = ref("")
const ordering = ref<string | null>(null)

const serverFilters = ref<Record<string, any>>({
  ...(tasksConfig.defaultQuery ?? {}),
})

const query = computed(() => ({
  page: page.value,
  page_size: pageSize.value,
  search: search.value || "",
  ordering: ordering.value || undefined,
  ...serverFilters.value,
}))

const { data, pending, error, refresh } = await useAsyncData<ApiList<TaskRow>>(
  () => `tasks:${JSON.stringify(query.value)}`,
  () => request(tasksConfig.endpoint, {
    method: "GET",
    query: query.value, 
  }),
  { server: false }
)

watchEffect(() => {
  const results = data.value?.results ?? []
  const count = data.value?.count ?? 0

  rows.value = results
  total.value = count
  totalPages.value = Math.max(1, Math.ceil(count / pageSize.value))
})

const debouncedSearch = useDebounceFn(() => {
  page.value = 1
  refresh()
}, 350)

function onApply({ search: s }: any) {
  search.value = s ?? ""
  page.value = 1
  refresh()
}

function onReset() {
  search.value = ""
  page.value = 1
  refresh()
}

function onSort({ key, dir }: { key: string | null; dir: "asc" | "desc" | null }) {
  if (!key || !dir) ordering.value = null
  else ordering.value = (dir === "desc" ? "-" : "") + key

  page.value = 1
  refresh()
}

// dialog state
const dialogOpen = ref(false)
const mode = ref<"create" | "edit">("create")
const selected = ref<TaskRow | null>(null)
const formLoading = ref(false)
const formErrors = ref<Record<string, any> | null>(null)

function openCreate() {
  if (!canMutate.value) return

  formErrors.value = null
  selected.value = null
  mode.value = "create"
  dialogOpen.value = true
}

function openEdit(row: TaskRow) {
  if (!canMutate.value) return

  formErrors.value = null
  selected.value = row
  mode.value = "edit"
  dialogOpen.value = true
}

function buildCompanyProfileFormData(payload: TaskPayload) {
  const fd = new FormData()

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    if (key === "id") return

    if (value instanceof File) {
      fd.append(key, value)
      return
    }

    fd.append(key, String(value))
  })

  return fd
}
async function submit(payload: TaskPayload) {
  if (!canMutate.value) return

  formLoading.value = true
  formErrors.value = null

  try {
    if (mode.value === "create") {
      await request(tasksConfig.endpoint, {
        method: "POST",
        body: payload,
      })

      notify.success(`Task "${payload.title}" created`)
    } else {
      await request(
        `${tasksConfig.endpoint}${payload.slug || selected.value?.slug}/`,
        {
          method: "PATCH",
          body: payload,
        }
      )

      notify.success(`Task "${payload.title}" updated`)
    }

    dialogOpen.value = false
    await refresh()
  } catch (e: any) {
    formErrors.value = e?.data ?? {
      detail: e?.message || "Failed to save",
    }
  } finally {
    formLoading.value = false
  }
}

// delete
const deleteOpen = ref(false)
const selectedDelete = ref<TaskRow | null>(null)

function remove(row: TaskRow) {
  if (!canMutate.value) return

  selectedDelete.value = row
  deleteOpen.value = true
}

async function confirmDelete() {
  if (!selectedDelete.value) return

  try {
    await request(
      `${tasksConfig.endpoint}${selectedDelete.value.id}/`,
      {
        method: "DELETE",
      }
    )
    notify.success(`Tasks "${selectedDelete.value.slug}" deleted`)
    deleteOpen.value = false
    selectedDelete.value = null
    await refresh()
  } catch (e: any) {
    notify.error(e?.data?.detail || e?.message || "Failed to delete")
  }
}

// bulk delete
const bulkDeleteOpen = ref(false)
const bulkDeleteRows = ref<TaskRow[]>([])
const bulkDeleting = ref(false)

function askBulkDelete(rows: unknown) {
  const selectedRows = Array.isArray(rows) ? rows as TaskRow[] : []

  if (!selectedRows.length) {
    notify.info("No rows selected")
    return
  }

  bulkDeleteRows.value = selectedRows
  bulkDeleteOpen.value = true
}

async function confirmBulkDelete() {
  if (!bulkDeleteRows.value.length) return

  bulkDeleting.value = true

  try {
    await Promise.all(
      bulkDeleteRows.value.map((row) =>
        request(
          `${tasksConfig.endpoint}${row.id}/`,
          {
            method: "DELETE",
          }
        )
      )
    )

    notify.success(`${bulkDeleteRows.value.length} Tasks row(s) deleted`)
    bulkDeleteOpen.value = false
    bulkDeleteRows.value = []
    await refresh()
  } catch (e: any) {
    notify.error(e?.data?.detail || e?.message || "Failed to bulk delete")
  } finally {
    bulkDeleting.value = false
  }
}

const columns = computed(() =>
  getTaskColumns(
    { onEdit: openEdit, onDelete: remove },
    { role: role.value }
  )
)

watchEffect(() => {
  if (error.value) {
    notify.error((error.value as any)?.message || "Failed to load categories")
  }
})
</script>

<template>
  <div class="w-full flex flex-col items-stretch gap-4">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-semibold">Tasks</h3>
        <p class="text-sm text-muted-foreground">
          Manage internal operational tasks, agenda, priorities, and site activities.
        </p>
      </div>
    </div>

    <DataTableMaster
      :columns="columns"
      :data="rows"
      :total="total"
      :totalPages="totalPages"
      :page="page"
      :pageSize="pageSize"
      :search="search"
      :loading="pending"
      :filtersSchema="tasksFilters"
      :showImport="false"
      :showExport="false"
      :showDownloadTemplate="false"
      :showSyncData="false"
      :showBulkDelete="false"
      :showRangeDelete="false"
      @update:search="(v) => { search = v; debouncedSearch() }"
      @applyFilters="onApply"
      @resetFilters="onReset"
      @changePage="(v) => { page = v; refresh() }"
      @changePageSize="(v) => { pageSize = v; page = 1; refresh() }"
      @changeSorting="onSort"
      @add="openCreate"
      @bulk-delete="askBulkDelete"
    />

    <DialogForm
      v-model:open="dialogOpen"
      :mode="mode"
      :role="role"
      :initial="selected"
      :loading="formLoading"
      :errors="formErrors || undefined"
      @submit="submit"
    />

    <div v-if="error" class="text-sm text-destructive">
      {{ (error as any)?.message || "Failed to load data" }}
    </div>

    <ConfirmDelete
      v-model:open="deleteOpen"
      title="Delete Tasks"
      :description="`Are you sure you want to delete '${selectedDelete?.slug ?? selectedDelete?.id}'? This action cannot be undone.`"
      @confirm="confirmDelete"
    />

    <ConfirmDelete
      v-model:open="bulkDeleteOpen"
      title="Bulk Delete Tasks"
      :description="`Are you sure you want to delete ${bulkDeleteRows.length} tasks row(s)? This action cannot be undone.`"
      @confirm="confirmBulkDelete"
    />
  </div>
</template>