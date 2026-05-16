<script setup lang="ts">
import { ref, computed, watchEffect } from "vue"
import { useDebounceFn } from "@vueuse/core"
import { useAsyncData } from "#app"

import ConfirmDelete from "@/components/ui/confirm-delete.vue"

import { useNotify } from "@/composables/useNotify"
import { useApi } from "@/composables/useApi"
import { useAuthStore } from "@/stores/auth"

import MediaLibraryCard from "@/modules/media/library/components/MediaLibraryCard.vue"

const { request } = useApi()
const notify = useNotify()
const auth = useAuthStore()

type ApiList<T> = {
  count: number
  results: T[]
}

export type MediaLibraryRow = {
  id: number
  title?: string | null
  type: "IMAGE" | "VIDEO"
  file_url?: string | null
  thumbnail_url?: string | null
  is_public: boolean
  is_featured: boolean
  category_detail?: {
    id: number
    name: string
    slug: string
  } | null
  albums_detail?: {
    id: number
    name: string
    slug: string
  }[]
}

const role = computed(() => (auth.user?.role ?? "ADMIN_USER") as any)
const canMutate = computed(() => role.value !== "GLOBAL_VIEWER")

const rows = ref<MediaLibraryRow[]>([])
const total = ref(0)
const totalPages = ref(1)

const page = ref(1)
const pageSize = ref(20)

const search = ref("")
const ordering = ref<string | null>(null)

const query = computed(() => ({
  page: page.value,
  page_size: pageSize.value,
  search: search.value || "",
  ordering: ordering.value || undefined,
}))

const { data, pending, error, refresh } = await useAsyncData<ApiList<MediaLibraryRow>>(
  () => `media-library:${JSON.stringify(query.value)}`,
  () =>
    request("/api/cms/media/", {
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

// delete
const deleteOpen = ref(false)
const selectedDelete = ref<MediaLibraryRow | null>(null)

function remove(row: MediaLibraryRow) {
  if (!canMutate.value) return

  selectedDelete.value = row
  deleteOpen.value = true
}

async function confirmDelete() {
  if (!selectedDelete.value) return

  try {
    await request(`/api/cms/media/${selectedDelete.value.id}/`, {
      method: "DELETE",
    })

    notify.success(
      `Media "${selectedDelete.value.title || selectedDelete.value.id}" deleted`
    )

    deleteOpen.value = false
    selectedDelete.value = null

    await refresh()
  } catch (e: any) {
    notify.error(e?.data?.detail || e?.message || "Failed to delete")
  }
}

watchEffect(() => {
  if (error.value) {
    notify.error(
      (error.value as any)?.message || "Failed to load media library"
    )
  }
})
</script>

<template>
  <div class="flex w-full flex-col gap-6">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-semibold">
          Media Library
        </h3>

        <p class="text-sm text-muted-foreground">
          Browse uploaded images, videos, featured media,
          and public gallery assets.
        </p>
      </div>
    </div>

    <!-- search -->
    <div class="flex items-center gap-3">
      <input
        v-model="search"
        type="text"
        placeholder="Search media..."
        class="w-full rounded-lg border bg-background px-3 py-2 text-sm"
        @input="debouncedSearch"
      />
    </div>

    <!-- loading -->
    <div
      v-if="pending"
      class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
    >
      <div
        v-for="i in 10"
        :key="i"
        class="aspect-square animate-pulse rounded-xl border bg-muted"
      />
    </div>

    <!-- grid -->
    <div
      v-else
      class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
    >
      <MediaLibraryCard
        v-for="media in rows"
        :key="media.id"
        :media="media"
        @delete="remove"
      />
    </div>

    <!-- pagination -->
    <div class="flex items-center justify-between border-t pt-4">
      <div class="text-sm text-muted-foreground">
        Showing {{ rows.length }} of {{ total }} media
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

    <!-- delete -->
    <ConfirmDelete
      v-model:open="deleteOpen"
      title="Delete Media"
      :description="`Are you sure you want to delete '${selectedDelete?.title ?? selectedDelete?.id}'? This action cannot be undone.`"
      @confirm="confirmDelete"
    />

    <div v-if="error" class="text-sm text-destructive">
      {{ (error as any)?.message || "Failed to load media" }}
    </div>
  </div>
</template>