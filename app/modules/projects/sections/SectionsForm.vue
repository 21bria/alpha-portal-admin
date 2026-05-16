<script setup lang="ts">
import { ref, computed, watchEffect } from "vue"
import { useDebounceFn } from "@vueuse/core"
import { useAsyncData } from "#app"
import { useRouter } from "vue-router"

import DataTableMaster from "@/components/data-table/DataTableMaster.vue"
import ConfirmDelete from "@/components/ui/confirm-delete.vue"

import { useNotify } from "@/composables/useNotify"
import { useApi } from "@/composables/useApi"
import { useAuthStore } from "@/stores/auth"


import {
  getProjectSectionColumns,
  type ProjectSectionRow,
} from "@/modules/projects/sections/columns"

import { sectionsConfig } from "@/modules/projects/sections/table"
import { sectionsFilters } from "@/modules/projects/sections/filters"

const router = useRouter()
const { request } = useApi()
const notify = useNotify()
const auth = useAuthStore()

type ApiList<T> = {
  count: number
  results: T[]
}

const role = computed(() => (auth.user?.role ?? "ADMIN_USER") as any)
const canMutate = computed(() => role.value !== "GLOBAL_VIEWER")

const rows = ref<ProjectSectionRow[]>([])
const total = ref(0)
const totalPages = ref(1)

const page = ref(1)
const pageSize = ref(10)
const search = ref("")
const ordering = ref<string | null>(null)
const serverFilters = ref<Record<string, any>>({
  ...(sectionsConfig.defaultQuery ?? {}),
})

const query = computed(() => ({
  page: page.value,
  page_size: pageSize.value,
  search: search.value || "",
  ordering: ordering.value || undefined,
  ...serverFilters.value,
}))

const { data, pending, error, refresh } = await useAsyncData<ApiList<ProjectSectionRow>>(
  () => `cms-projects-sections:${JSON.stringify(query.value)}`,
  () =>
    request(sectionsConfig.endpoint, {
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

function onApply({ search: s, filters }: any) {
  search.value = s ?? ""
  serverFilters.value = { ...(filters ?? {}) }
  page.value = 1
  refresh()
}

function onReset() {
  search.value = ""
  serverFilters.value = { ...(sectionsConfig.defaultQuery ?? {}) }
  page.value = 1
  refresh()
}

function onSort({ key, dir }: { key: string | null; dir: "asc" | "desc" | null }) {
  if (!key || !dir) ordering.value = null
  else ordering.value = (dir === "desc" ? "-" : "") + key

  page.value = 1
  refresh()
}

function openCreate() {
  if (!canMutate.value) return
  router.push("/cms/projects/post/create")
}

function openEdit(row: ProjectSectionRow) {
  if (!canMutate.value) return
  router.push(`/cms/projects/post/${row.id}/edit`)
}

// delete
const deleteOpen = ref(false)
const selectedDelete = ref<ProjectSectionRow | null>(null)

function remove(row: ProjectSectionRow) {
  if (!canMutate.value) return

  selectedDelete.value = row
  deleteOpen.value = true
}

async function confirmDelete() {
  if (!selectedDelete.value) return

  try {
    await request(`${sectionsConfig.endpoint}${selectedDelete.value.id}/`, {
      method: "DELETE",
    })

    notify.success(`Section "${selectedDelete.value.title ?? selectedDelete.value.id}" deleted`)
    deleteOpen.value = false
    selectedDelete.value = null
    await refresh()
  } catch (e: any) {
    notify.error(e?.data?.detail || e?.message || "Failed to delete section")
  }
}

// bulk delete
const bulkDeleteOpen = ref(false)
const bulkDeleteRows = ref<ProjectSectionRow[]>([])
const bulkDeleting = ref(false)

function askBulkDelete(rows: unknown) {
  const selectedRows = Array.isArray(rows) ? (rows as ProjectSectionRow[]) : []

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
        request(`${sectionsConfig.endpoint}${row.id}/`, {
          method: "DELETE",
        })
      )
    )

    notify.success(`${bulkDeleteRows.value.length} section row(s) deleted`)
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
  getProjectSectionColumns(
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
    notify.error((error.value as any)?.message || "Failed to load sections")
  }
})
</script>

<template>
  <div class="w-full flex flex-col items-stretch gap-4">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-semibold">Project Sections</h3>
        <p class="text-sm text-muted-foreground">
          Manage flexible project page sections such as overview, location, map,
          highlights, gallery, timeline, CTA, and structured project content.
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
      :filtersSchema="sectionsFilters" 
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

    <div v-if="error" class="text-sm text-destructive">
      {{ (error as any)?.message || "Failed to load data" }}
    </div>

    <ConfirmDelete v-model:open="deleteOpen" title="Delete Section"
      :description="`Are you sure you want to delete '${selectedDelete?.title ?? selectedDelete?.id}'? This action cannot be undone.`"
      @confirm="confirmDelete" />

    <ConfirmDelete v-model:open="bulkDeleteOpen" title="Bulk Delete Sections"
      :description="`Are you sure you want to delete ${bulkDeleteRows.length} section row(s)? This action cannot be undone.`"
      @confirm="confirmBulkDelete" />

  </div>
</template>