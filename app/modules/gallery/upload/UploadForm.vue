<script setup lang="ts">
import { ref, computed } from "vue"
import { Upload, Loader2 } from "lucide-vue-next"

import { useNotify } from "@/composables/useNotify"
import { useApi } from "@/composables/useApi"

import SelectLookup from "@/components/AsyncLookupSelect.vue"

const { request } = useApi()
const notify = useNotify()

const loading = ref(false)

const form = ref({
  title: "",
  description: "",
  files: [] as File[],

  category: null as number | null,
  albums: null as number | number[] | null,

  is_public: true,
  is_featured: false,
})

const previews = computed(() => {
  return form.value.files.map((file) => ({
    name: file.name,
    size: file.size,
    type: file.type,
    url: file.type.startsWith("image")
      ? URL.createObjectURL(file)
      : null,
  }))
})

function onFiles(event: Event) {
  const target = event.target as HTMLInputElement
  form.value.files = Array.from(target.files || [])
}

function removeFile(index: number) {
  form.value.files.splice(index, 1)
}

function resetForm() {
  form.value = {
    title: "",
    description: "",
    files: [],
    category: null,
    albums: null,
    is_public: true,
    is_featured: false,
  }
}

function getAlbumIds() {
  if (Array.isArray(form.value.albums)) {
    return form.value.albums
  }

  if (form.value.albums) {
    return [form.value.albums]
  }

  return []
}

async function submit() {
  if (!form.value.files.length) {
    notify.error("Please select media files")
    return
  }

  loading.value = true

  try {
    const albumIds = getAlbumIds()

    for (const file of form.value.files) {
      const body = new FormData()

      body.append("title", form.value.title || file.name)
      body.append("description", form.value.description)

      body.append(
        "type",
        file.type.startsWith("video") ? "VIDEO" : "IMAGE"
      )

      body.append("file", file)

      if (form.value.category) {
        body.append("category", String(form.value.category))
      }

      albumIds.forEach((id) => {
        body.append("albums", String(id))
      })

      body.append("is_public", String(form.value.is_public))
      body.append("is_featured", String(form.value.is_featured))

      await request("/api/cms/media/", {
        method: "POST",
        body,
      })
    }

    notify.success(`${form.value.files.length} media uploaded`)
    resetForm()
  } catch (e: any) {
    notify.error(
      e?.data?.detail ||
        e?.message ||
        "Upload failed"
    )
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-7xl flex-col gap-6">
    <div>
      <h2 class="text-2xl font-bold tracking-tight">
        Upload Media
      </h2>

      <p class="text-muted-foreground">
        Upload image and video assets for albums,
        galleries, and public portal media.
      </p>
    </div>

    <div class="rounded-2xl border bg-card p-6">
      <div class="grid gap-6">
        <div class="grid gap-3">
          <label class="text-sm font-medium">
            Media Files
          </label>

          <label
            class="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/30 px-6 py-10 text-center transition hover:border-primary hover:bg-muted">
            <input type="file" accept="image/*,video/*" multiple class="hidden" @change="onFiles" />

            <!-- icon -->
            <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-background shadow-sm">
              <span class="text-2xl">
                ⬆
              </span>
            </div>

            <!-- text -->
            <div class="space-y-1">
              <p class="text-sm font-medium">
                Click to upload media
              </p>

              <p class="text-xs text-muted-foreground">
                JPG, PNG, WEBP, MP4
              </p>

              <p class="text-xs text-muted-foreground">
                Multiple files supported
              </p>
            </div>
          </label>

          <!-- selected files -->
          <!-- <div v-if="form.files.length" class="rounded-xl border bg-background p-3">
            <div class="mb-2 text-xs font-medium text-muted-foreground">
              Selected Files
            </div>

            <div class="space-y-2">
              <div v-for="(file, index) in form.files" :key="`${file.name}-${index}`"
                class="flex items-center justify-between rounded-lg border px-3 py-2">
                <div class="min-w-0">
                  <p class="truncate text-sm font-medium">
                    {{ file.name }}
                  </p>

                  <p class="text-xs text-muted-foreground">
                    {{ (file.size / 1024 / 1024).toFixed(2) }} MB
                  </p>
                </div>

                <button type="button" class="text-xs text-destructive" @click="removeFile(index)">
                  Remove
                </button>
              </div>
            </div>
          </div> -->
        </div>

        <div v-if="previews.length" class="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <div v-for="(item, index) in previews" :key="`${item.name}-${index}`"
            class="overflow-hidden rounded-xl border bg-background">
            <div class="aspect-square bg-muted">
              <img v-if="item.url" :src="item.url" :alt="item.name" class="h-full w-full object-cover" />

              <div v-else class="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                Video
              </div>
            </div>

            <div class="space-y-2 p-3">
              <p class="truncate text-xs font-medium">
                {{ item.name }}
              </p>

              <button type="button" class="text-xs text-destructive" @click="removeFile(index)">
                Remove
              </button>
            </div>
          </div>
        </div>

        <div class="grid gap-2">
          <label class="text-sm font-medium">
            Title
          </label>

          <input v-model="form.title" class="rounded-lg border bg-background px-3 py-2 text-sm"
            placeholder="Optional, defaults to file name" />
        </div>

        <div class="grid gap-2">
          <label class="text-sm font-medium">
            Description
          </label>

          <textarea v-model="form.description" rows="4" class="rounded-lg border bg-background px-3 py-2 text-sm"
            placeholder="Description..." />
        </div>

        <div class="grid gap-2">
          <label class="text-sm font-medium">
            Category
          </label>

          <SelectLookup v-model="form.category" label="Category" endpoint="/api/cms/media-categories/" label-key="name"
            value-key="id" placeholder="Select category" />
        </div>

        <div class="grid gap-2">
          <label class="text-sm font-medium">
            Albums
          </label>

          <SelectLookup v-model="form.albums" label="Albums" endpoint="/api/cms/albums/" label-key="name" value-key="id"
            placeholder="Select albums" />
        </div>


        <!-- toggles -->
        <div class="flex flex-wrap items-center gap-6">
          <label class="flex items-center gap-3">
            <input v-model="form.is_public" type="checkbox" class="h-4 w-4 rounded border" />

            <span class="text-sm">
              Public Media
            </span>
          </label>

          <label class="flex items-center gap-3">
            <input v-model="form.is_featured" type="checkbox" class="h-4 w-4 rounded border" />

            <span class="text-sm">
              Featured Media
            </span>
          </label>
        </div>
        <div class="flex justify-end">
          <button type="button"
            class="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
            :disabled="loading" @click="submit">
            {{ loading ? "Uploading..." : "Upload Media" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>