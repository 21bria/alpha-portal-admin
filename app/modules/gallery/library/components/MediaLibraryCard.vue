<script setup lang="ts">
import DataTableRowActions from "./DataTableRowActions.vue"

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

defineProps<{
  media: MediaLibraryRow
}>()

const emit = defineEmits<{
  delete: [media: MediaLibraryRow]
}>()
</script>

<template>
  <div
    class="group overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:shadow-md"
  >
    <!-- preview -->
    <div class="relative aspect-square overflow-hidden bg-muted">
      <!-- image -->
      <img
        v-if="media.type === 'IMAGE' && media.file_url"
        :src="media.file_url"
        :alt="media.title || 'Media'"
        class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
      />

      <!-- video -->
      <div
        v-else-if="media.type === 'VIDEO'"
        class="flex h-full w-full items-center justify-center bg-black text-white"
      >
        <div class="flex flex-col items-center gap-2">
          <div
            class="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-2xl backdrop-blur"
          >
            ▶
          </div>

          <span class="text-xs opacity-80">
            Video
          </span>
        </div>
      </div>

      <!-- empty -->
      <div
        v-else
        class="flex h-full w-full items-center justify-center text-sm text-muted-foreground"
      >
        No Preview
      </div>

      <!-- badges -->
      <div class="absolute left-3 top-3 flex items-center gap-2">
        <span
          class="rounded-full px-2 py-1 text-[11px] font-medium backdrop-blur"
          :class="
            media.type === 'IMAGE'
              ? 'bg-sky-500/10 text-sky-600'
              : 'bg-violet-500/10 text-violet-600'
          "
        >
          {{ media.type }}
        </span>

        <span
          v-if="media.is_featured"
          class="rounded-full bg-amber-500/10 px-2 py-1 text-[11px] font-medium text-amber-600 backdrop-blur"
        >
          Featured
        </span>
      </div>

      <!-- visibility -->
      <div class="absolute right-3 top-3">
        <span
          class="rounded-full px-2 py-1 text-[11px] font-medium backdrop-blur"
          :class="
            media.is_public
              ? 'bg-emerald-500/10 text-emerald-600'
              : 'bg-black/40 text-white'
          "
        >
          {{ media.is_public ? "Public" : "Private" }}
        </span>
      </div>
    </div>

    <!-- body -->
    <div class="space-y-4 p-4">
      <div class="space-y-1">
        <h3 class="truncate text-sm font-semibold">
          {{ media.title || "Untitled Media" }}
        </h3>

        <p
          v-if="media.category_detail"
          class="text-xs text-muted-foreground"
        >
          {{ media.category_detail.name }}
        </p>
      </div>

      <!-- albums -->
      <div
        v-if="media.albums_detail?.length"
        class="flex flex-wrap gap-1"
      >
        <span
          v-for="album in media.albums_detail.slice(0, 3)"
          :key="album.id"
          class="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
        >
          {{ album.name }}
        </span>

        <span
          v-if="media.albums_detail.length > 3"
          class="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
        >
          +{{ media.albums_detail.length - 3 }}
        </span>
      </div>

      <!-- actions -->
      <div class="flex items-center justify-end">
        <DataTableRowActions
          :row="media"
          @delete="emit('delete', media)"
        />
      </div>
    </div>
  </div>
</template>