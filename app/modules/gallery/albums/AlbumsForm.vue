<script setup lang="ts">
import { ref, computed, watchEffect } from "vue"
import { useDebounceFn } from "@vueuse/core"
import { useAsyncData } from "#app"

import ConfirmDelete from "@/components/ui/confirm-delete.vue"

import { useNotify } from "@/composables/useNotify"
import { useApi } from "@/composables/useApi"
import { useAuthStore } from "@/stores/auth"

import DialogForm from "@/modules/gallery/albums/components/DialogForm.vue"
import MediaAlbumCard from "@/modules/gallery/albums/components/MediaAlbumCard.vue"

import type { MediaAlbumRow } from "@/modules/gallery/albums/columns"

import { albumsConfig } from "@/modules/gallery/albums/table"

const { request } = useApi()
const notify = useNotify()
const auth = useAuthStore()

type ApiList<T> = {
  count: number
  results: T[]
}

const role = computed(() => (auth.user?.role ?? "ADMIN_USER") as any)
const canMutate = computed(() => role.value !== "GLOBAL_VIEWER")

const rows = ref<MediaAlbumRow[]>([])
const total = ref(0)
const totalPages = ref(1)

const page = ref(1)
const pageSize = ref(12)

const search = ref("")
const ordering = ref<string | null>(null)

const query = computed(() => ({
  page: page.value,
  page_size: pageSize.value,
  search: search.value || "",
  ordering: ordering.value || undefined,
}))

const { data, pending, error, refresh } = await useAsyncData<ApiList<MediaAlbumRow>>(
  () => `media-albums:${JSON.stringify(query.value)}`,
  () =>
    request(albumsConfig.endpoint, {
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

// dialog
const dialogOpen = ref(false)
const mode = ref<"create" | "edit">("create")
const selected = ref<MediaAlbumRow | null>(null)

const formLoading = ref(false)
const formErrors = ref<Record<string, any> | null>(null)

function openCreate() {
  if (!canMutate.value) return

  formErrors.value = null
  selected.value = null
  mode.value = "create"
  dialogOpen.value = true
}

function openEdit(row: MediaAlbumRow) {
  if (!canMutate.value) return

  formErrors.value = null
  selected.value = row
  mode.value = "edit"
  dialogOpen.value = true
}

async function submit(payload: any) {
  if (!canMutate.value) return

  formLoading.value = true
  formErrors.value = null

  try {
    if (mode.value === "create") {
      await request(albumsConfig.endpoint, {
        method: "POST",
        body: payload,
      })

      notify.success(`Album "${payload.name}" created`)
    } else {
      await request(
        `${albumsConfig.endpoint}${selected.value?.slug}/`,
        {
          method: "PATCH",
          body: payload,
        }
      )

      notify.success(`Album "${payload.name}" updated`)
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
const selectedDelete = ref<MediaAlbumRow | null>(null)

function remove(row: MediaAlbumRow) {
  if (!canMutate.value) return

  selectedDelete.value = row
  deleteOpen.value = true
}

async function confirmDelete() {
  if (!selectedDelete.value) return

  try {
    await request(
      `${albumsConfig.endpoint}${selectedDelete.value.slug}/`,
      {
        method: "DELETE",
      }
    )

    notify.success(`Album "${selectedDelete.value.name}" deleted`)

    deleteOpen.value = false
    selectedDelete.value = null

    await refresh()
  } catch (e: any) {
    notify.error(e?.data?.detail || e?.message || "Failed to delete")
  }
}

watchEffect(() => {
  if (error.value) {
    notify.error((error.value as any)?.message || "Failed to load albums")
  }
})
</script>

<template>
  <div class="flex w-full flex-col gap-6">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-semibold">
          Media Albums
        </h3>

        <p class="text-sm text-muted-foreground">
          Manage media gallery albums and public collections.
        </p>
      </div>

      <button
        v-if="canMutate"
        class="rounded-lg border px-4 py-2 text-sm font-medium"
        @click="openCreate" >
        Create
      </button>
    </div>

    <div class="flex items-center gap-3">
      <input
        v-model="search"
        type="text"
        placeholder="Search albums..."
        class="w-full rounded-lg border bg-background px-3 py-2 text-sm"
        @input="debouncedSearch"
      />
    </div>

    <div
      v-if="pending"
      class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      <div
        v-for="i in 8"
        :key="i"
        class="h-[260px] animate-pulse rounded-xl border bg-muted"
      />
    </div>

    <div
      v-else
      class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
       >
      <MediaAlbumCard
        v-for="album in rows"
        :key="album.id"
        :album="album"
        @edit="openEdit"
        @delete="remove"
      />
    </div>

    <div
      class="flex items-center justify-between border-t pt-4"
    >
      <div class="text-sm text-muted-foreground">
        Showing {{ rows.length }} of {{ total }} albums
      </div>

      <div class="flex items-center gap-2">
        <button
          class="rounded-lg border px-3 py-1.5 text-sm"
          :disabled="page <= 1"
          @click="
            () => {
              page--
              refresh()
            }
          "
        >
          Previous
        </button>

        <div class="text-sm">
          Page {{ page }} of {{ totalPages }}
        </div>

        <button
          class="rounded-lg border px-3 py-1.5 text-sm"
          :disabled="page >= totalPages"
          @click="
            () => {
              page++
              refresh()
            }
          "
        >
          Next
        </button>
      </div>
    </div>

    <DialogForm
      v-model:open="dialogOpen"
      :mode="mode"
      :role="role"
      :initial="selected"
      :loading="formLoading"
      :errors="formErrors || undefined"
      @submit="submit"
    />

    <ConfirmDelete
      v-model:open="deleteOpen"
      title="Delete Album"
      :description="`Are you sure you want to delete '${selectedDelete?.name ?? selectedDelete?.id}'? This action cannot be undone.`"
      @confirm="confirmDelete"
    />
  </div>
</template>