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
  type PagePayload,
} from "@/modules/static/page/components/DialogForm.vue"

import {
  getPageColumns,
  type PageRow,
} from "@/modules/static/page/columns"

import { pageConfig } from "@/modules/static/page/table"
import { pageFilters } from "@/modules/static/page/filters"

const { request } = useApi()
const notify = useNotify()
const auth = useAuthStore()

type ApiList<T> = {
  count: number
  results: T[]
}

const role = computed(() => (auth.user?.role ?? "ADMIN_USER") as any)
const canMutate = computed(() => role.value !== "GLOBAL_VIEWER")

const rows = ref<PageRow[]>([])
const total = ref(0)
const totalPages = ref(1)

const page = ref(1)
const pageSize = ref(10)
const search = ref("")
const ordering = ref<string | null>(null)

const serverFilters = ref<Record<string, any>>({
  ...(pageConfig.defaultQuery ?? {}),
})

const query = computed(() => ({
  page: page.value,
  page_size: pageSize.value,
  search: search.value || "",
  ordering: ordering.value || undefined,
  ...serverFilters.value,
}))

const { data, pending, error, refresh } = await useAsyncData<ApiList<PageRow>>(
  () => `cms-pages:${JSON.stringify(query.value)}`,
  () =>
    request(pageConfig.endpoint, {
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
const selected = ref<PageRow | null>(null)
const formLoading = ref(false)
const formErrors = ref<Record<string, any> | null>(null)

function openCreate() {
  if (!canMutate.value) return

  formErrors.value = null
  selected.value = null
  mode.value = "create"
  dialogOpen.value = true
}

function openEdit(row: PageRow) {
  if (!canMutate.value) return

  formErrors.value = null
  selected.value = row
  mode.value = "edit"
  dialogOpen.value = true
}

async function submit(payload: PagePayload) {
  if (!canMutate.value) return

  formLoading.value = true
  formErrors.value = null

  try {
    if (mode.value === "create") {
      await request(pageConfig.endpoint, {
        method: "POST",
        body: payload,
      })

      notify.success(`Page "${payload.title}" created`)
    } else {
      await request(
        `${pageConfig.endpoint}${payload.slug || selected.value?.slug}/`,
        {
          method: "PATCH",
          body: payload,
        }
      )

      notify.success(`Page "${payload.title}" updated`)
    }

    dialogOpen.value = false

    await refresh()
  } catch (e: any) {
    formErrors.value = e?.data ?? {
      detail: e?.message || "Failed to save page",
    }
  } finally {
    formLoading.value = false
  }
}

// delete
const deleteOpen = ref(false)
const selectedDelete = ref<PageRow | null>(null)

function remove(row: PageRow) {
  if (!canMutate.value) return

  selectedDelete.value = row
  deleteOpen.value = true
}

async function confirmDelete() {
  if (!selectedDelete.value) return

  try {
    await request(
      `${pageConfig.endpoint}${selectedDelete.value.slug}/`,
      {
        method: "DELETE",
      }
    )
    notify.success(`Page "${selectedDelete.value.title}" deleted`)
    deleteOpen.value = false
    selectedDelete.value = null
    await refresh()
  } catch (e: any) {
    notify.error(e?.data?.detail || e?.message || "Failed to delete")
  }
}

// bulk delete
const bulkDeleteOpen = ref(false)
const bulkDeleteRows = ref<PageRow[]>([])
const bulkDeleting = ref(false)

function askBulkDelete(rows: unknown) {
  const selectedRows = Array.isArray(rows) ? rows as PageRow[] : []

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
          `${pageConfig.endpoint}${row.slug}/`,
          {
            method: "DELETE",
          }
        )
      )
    )

    notify.success(`${bulkDeleteRows.value.length} category row(s) deleted`)
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
  getPageColumns(
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
    notify.error((error.value as any)?.message || "Failed to load categories")
  }
})
</script>

<template>
  <div class="w-full flex flex-col items-stretch gap-4">
    <div class="flex items-center justify-between">
      <div>
       <h3 class="text-lg font-semibold">
        Website Pages
      </h3>
      <p class="text-sm text-muted-foreground">
        Manage static pages, landing pages, SEO metadata,
        and public website content for the company portal.
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
      :filtersSchema="pageFilters"
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
      title="Delete Page"
      :description="`Are you sure you want to delete '${selectedDelete?.title ?? selectedDelete?.id}'? This action cannot be undone.`"
      @confirm="confirmDelete"
    />

    <ConfirmDelete
      v-model:open="bulkDeleteOpen"
      title="Bulk Delete Pages"
      :description="`Are you sure you want to delete ${bulkDeleteRows.length} page row(s)? This action cannot be undone.`"
      @confirm="confirmBulkDelete"
    />
  </div>
</template>