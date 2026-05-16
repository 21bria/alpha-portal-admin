<script setup lang="ts">
import DataTableRowActions from "./DataTableRowActions.vue"

export type MediaAlbumRow = {
  id: number
  name: string
  slug: string
  description?: string | null
  cover?: number | null
  cover_url?: string | null
  is_public: boolean
  total_items?: number
}

defineProps<{
  album: MediaAlbumRow
}>()

const emit = defineEmits<{
  edit: [album: MediaAlbumRow]
  delete: [album: MediaAlbumRow]
}>()
</script>

<template>
  <div class="group overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:shadow-md">
    <!-- cover -->
    <div class="relative aspect-video overflow-hidden bg-muted">
      <img v-if="album.cover_url" :src="album.cover_url" :alt="album.name"
        class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]" />
      <div v-else class="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
        No Cover
      </div>

      <div class="absolute right-3 top-3">
        <span class="rounded-full px-2 py-1 text-[11px] font-medium backdrop-blur" :class="album.is_public
            ? 'bg-emerald-500/10 text-emerald-600'
            : 'bg-black/40 text-white'
          ">
          {{ album.is_public ? "Public" : "Private" }}
        </span>
      </div>
    </div>

    <!-- body -->
    <div class="space-y-4 p-4">
      <div class="space-y-1">
        <h3 class="truncate text-sm font-semibold">
          {{ album.name }}
        </h3>

        <p class="truncate text-xs text-muted-foreground">
          {{ album.slug }}
        </p>

        <p v-if="album.description" class="line-clamp-2 text-xs text-muted-foreground">
          {{ album.description }}
        </p>
      </div>

      <div class="flex items-center justify-between">
        <div class="text-xs text-muted-foreground">
          {{ album.total_items ?? 0 }} media
        </div>

        <DataTableRowActions :row="album" @edit="emit('edit', album)" @delete="emit('delete', album)" />
      </div>
    </div>
  </div>
</template>