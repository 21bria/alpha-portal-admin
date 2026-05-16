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
  type ProjectPayload,
} from "@/modules/projects/page/components/DialogForm.vue"

import {
  getProjectColumns,
  type ProjectRow,
} from "@/modules/projects/page/columns"

import { projectsConfig } from "@/modules/projects/page/table"
import { projectsFilters } from "@/modules/projects/page/filters"

const { request } = useApi()
const notify = useNotify()
const auth = useAuthStore()

type ApiList<T> = {
  count: number
  results: T[]
}

const role = computed(() => (auth.user?.role ?? "ADMIN_USER") as any)
const canMutate = computed(() => role.value !== "GLOBAL_VIEWER")

const rows = ref<ProjectRow[]>([])
const total = ref(0)
const totalPages = ref(1)

const page = ref(1)
const pageSize = ref(10)
const search = ref("")
const ordering = ref<string | null>(null)

const serverFilters = ref<Record<string, any>>({
  ...(projectsConfig.defaultQuery ?? {}),
})

const query = computed(() => ({
  page: page.value,
  page_size: pageSize.value,
  search: search.value || "",
  ordering: ordering.value || undefined,
  ...serverFilters.value,
}))

const { data, pending, error, refresh } = await useAsyncData<ApiList<ProjectRow>>(
  () => `cms-projects:${JSON.stringify(query.value)}`,
  () =>
    request(projectsConfig.endpoint, {
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
const selected = ref<ProjectRow | null>(null)
const formLoading = ref(false)
const formErrors = ref<Record<string, any> | null>(null)

function openCreate() {
  if (!canMutate.value) return

  formErrors.value = null
  selected.value = null
  mode.value = "create"
  dialogOpen.value = true
}

function openEdit(row: ProjectRow) {
  if (!canMutate.value) return

  formErrors.value = null
  selected.value = row
  mode.value = "edit"
  dialogOpen.value = true
}

async function submit(payload: ProjectPayload) {
  if (!canMutate.value) return

  formLoading.value = true
  formErrors.value = null

  try {
    if (mode.value === "create") {
      await request(projectsConfig.endpoint, {
        method: "POST",
        body: payload,
      })

      notify.success(`Project "${payload.title}" created`)
    } else {
      await request(
        `${projectsConfig.endpoint}${payload.slug || selected.value?.slug}/`,
        {
          method: "PATCH",
          body: payload,
        }
      )

      notify.success(`Project "${payload.title}" updated`)
    }

    dialogOpen.value = false

    await refresh()
  } catch (e: any) {
    formErrors.value = e?.data ?? {
      detail: e?.message || "Failed to save project",
    }
  } finally {
    formLoading.value = false
  }
}

// delete
const deleteOpen = ref(false)
const selectedDelete = ref<ProjectRow | null>(null)

function remove(row: ProjectRow) {
  if (!canMutate.value) return

  selectedDelete.value = row
  deleteOpen.value = true
}

async function confirmDelete() {
  if (!selectedDelete.value) return

  try {
    await request(
      `${projectsConfig.endpoint}${selectedDelete.value.slug}/`,
      {
        method: "DELETE",
      }
    )
    notify.success(`project "${selectedDelete.value.title}" deleted`)
    deleteOpen.value = false
    selectedDelete.value = null
    await refresh()
  } catch (e: any) {
    notify.error(e?.data?.detail || e?.message || "Failed to delete")
  }
}

// bulk delete
const bulkDeleteOpen = ref(false)
const bulkDeleteRows = ref<ProjectRow[]>([])
const bulkDeleting = ref(false)

function askBulkDelete(rows: unknown) {
  const selectedRows = Array.isArray(rows) ? rows as ProjectRow[] : []

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
          `${projectsConfig.endpoint}${row.slug}/`,
          {
            method: "DELETE",
          }
        )
      )
    )

    notify.success(`${bulkDeleteRows.value.length} projects row(s) deleted`)
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
  getProjectColumns(
    {
      onEdit: openEdit,
      onDelete: remove,
    },
    {
      role: role.value,
    }
  )
)

watchEffect(() => {
  if (error.value) {
   notify.error((error.value as any)?.message || "Failed to load projects")
  }
})
</script>

<template>
  <div class="w-full flex flex-col items-stretch gap-4">
    <div class="flex items-center justify-between">
      <div>
      <h3 class="text-lg font-semibold">
        Projects
      </h3>

      <p class="text-sm text-muted-foreground">
        Manage mining projects, operational sites, exploration areas,
        project locations, public project content, and structured project pages.
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
      :filtersSchema="projectsFilters"
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
      title="Delete Projects"
      :description="`Are you sure you want to delete '${selectedDelete?.title ?? selectedDelete?.id}'? This action cannot be undone.`"
      @confirm="confirmDelete"
    />

    <ConfirmDelete
      v-model:open="bulkDeleteOpen"
      title="Bulk Delete Projects"
      :description="`Are you sure you want to delete ${bulkDeleteRows.length} projects row(s)? This action cannot be undone.`"
      @confirm="confirmBulkDelete"
    />
  </div>
</template>