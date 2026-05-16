<script setup lang="ts">
import { ref, watch, computed } from "vue"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type UserRole = "SYSTEM" | "GLOBAL_VIEWER" | "ADMIN_USER"

export type ProjectPayload = {
  id?: number
  title: string
  slug?: string
  subtitle?: string
  description?: string
  overview?: string
  location?: string
  province?: string
  commodity?: string
  status?: string
  latitude?: string | number | null
  longitude?: string | number | null
  highlights?: string[]
  is_published: boolean
  seo_title?: string
  seo_description?: string
}

type ProjectFormState = {
  id?: number
  title: string
  slug: string
  subtitle: string
  description: string
  overview: string
  location: string
  province: string
  commodity: string
  status: string
  latitude: string
  longitude: string
  highlights_text: string
  is_published: boolean
  seo_title: string
  seo_description: string
}

const props = defineProps<{
  open: boolean
  mode: "create" | "edit"
  role: UserRole
  initial?: Record<string, any> | null
  loading?: boolean
  errors?: Record<string, any> | null
}>()

const emit = defineEmits<{
  (e: "update:open", v: boolean): void
  (e: "submit", payload: ProjectPayload): void
}>()

const canMutate = computed(() => props.role !== "GLOBAL_VIEWER")

const title = computed(() =>
  props.mode === "create" ? "Add Project" : "Edit Project"
)

const statusOptions = [
  { value: "active", label: "Active Site" },
  { value: "development", label: "Development" },
  { value: "operational", label: "Operational" },
  { value: "exploration", label: "Exploration" },
]

const local = ref<ProjectFormState>({
  id: undefined,
  title: "",
  slug: "",
  subtitle: "",
  description: "",
  overview: "",
  location: "",
  province: "",
  commodity: "Nickel Ore",
  status: "active",
  latitude: "",
  longitude: "",
  highlights_text: "",
  is_published: true,
  seo_title: "",
  seo_description: "",
})

function fieldError(key: string) {
  const e = props.errors?.[key]
  return Array.isArray(e) ? e[0] : e ?? null
}

function close() {
  emit("update:open", false)
}

function parseHighlights(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
}

function submit() {
  const payload: ProjectPayload = {
    id: local.value.id,
    title: local.value.title.trim(),
    slug: local.value.slug.trim() || "",
    subtitle: local.value.subtitle.trim(),
    description: local.value.description.trim(),
    overview: local.value.overview.trim(),
    location: local.value.location.trim(),
    province: local.value.province.trim(),
    commodity: local.value.commodity.trim() || "Nickel Ore",
    status: local.value.status,
    latitude: local.value.latitude ? local.value.latitude : null,
    longitude: local.value.longitude ? local.value.longitude : null,
    highlights: parseHighlights(local.value.highlights_text),
    is_published: local.value.is_published,
    seo_title: local.value.seo_title.trim(),
    seo_description: local.value.seo_description.trim(),
  }

  emit("submit", payload)
}

watch(
  () => props.open,
  (open) => {
    if (!open) return

    const highlights = Array.isArray(props.initial?.highlights)
      ? props.initial.highlights.join("\n")
      : ""

    local.value = {
      id: props.initial?.id,
      title: props.initial?.title ?? "",
      slug: props.initial?.slug ?? "",
      subtitle: props.initial?.subtitle ?? "",
      description: props.initial?.description ?? "",
      overview: props.initial?.overview ?? "",
      location: props.initial?.location ?? "",
      province: props.initial?.province ?? "",
      commodity: props.initial?.commodity ?? "Nickel Ore",
      status: props.initial?.status ?? "active",
      latitude: props.initial?.latitude ?? "",
      longitude: props.initial?.longitude ?? "",
      highlights_text: highlights,
      is_published: props.initial?.is_published ?? true,
      seo_title: props.initial?.seo_title ?? "",
      seo_description: props.initial?.seo_description ?? "",
    }
  },
  { immediate: true }
)
</script>

<template>
  <Dialog :open="open" @update:open="(v) => emit('update:open', v)">
    <DialogContent class="flex max-h-[90vh] flex-col overflow-hidden sm:max-w-4xl">
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
      </DialogHeader>

      <div class="overflow-y-auto py-2">
        <div class="grid gap-5 py-2">
          <div class="rounded-xl border p-4">
            <div class="mb-4">
              <h3 class="font-semibold">Project Information</h3>
              <p class="text-xs text-muted-foreground">
                Basic project identity and public listing information.
              </p>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <div class="grid gap-2 md:col-span-2">
                <label class="text-sm font-medium">Project Title</label>
                <Input v-model="local.title" placeholder="Example: Gebe Nickel Project" :disabled="!canMutate" />
                <p v-if="fieldError('title')" class="text-sm text-destructive">
                  {{ fieldError("title") }}
                </p>
              </div>

              <div class="grid gap-2">
                <label class="text-sm font-medium">Slug</label>
                <Input v-model="local.slug" placeholder="Auto generated if empty" :disabled="!canMutate" />
                <p class="text-xs text-muted-foreground">
                  Leave empty to auto-generate from project title.
                </p>
                <p v-if="fieldError('slug')" class="text-sm text-destructive">
                  {{ fieldError("slug") }}
                </p>
              </div>

              <div class="grid gap-2">
                <label class="text-sm font-medium">Status</label>
                <select v-model="local.status" class="h-10 rounded-md border bg-background px-3 text-sm"
                  :disabled="!canMutate">
                  <option v-for="item in statusOptions" :key="item.value" :value="item.value">
                    {{ item.label }}
                  </option>
                </select>
                <p class="text-xs text-muted-foreground">
                  Status from project.
                </p>
                <p v-if="fieldError('status')" class="text-sm text-destructive">
                  {{ fieldError("status") }}
                </p>
              </div>

              <div class="grid gap-2">
                <label class="text-sm font-medium">Commodity</label>
                <Input v-model="local.commodity" placeholder="Nickel Ore" :disabled="!canMutate" />
              </div>

              <div class="grid gap-2">
                <label class="text-sm font-medium">Province</label>
                <Input v-model="local.province" placeholder="Example: Maluku Utara" :disabled="!canMutate" />
              </div>

              <div class="grid gap-2 md:col-span-2">
                <label class="text-sm font-medium">Location</label>
                <Input v-model="local.location" placeholder="Example: Pulau Gebe, Halmahera Tengah, Maluku Utara"
                  :disabled="!canMutate" />
              </div>
            </div>
          </div>

          <div class="rounded-xl border p-4">
            <div class="mb-4">
              <h3 class="font-semibold">Content</h3>
              <p class="text-xs text-muted-foreground">
                Short and detailed content for the project page.
              </p>
            </div>

            <div class="grid gap-4">
              <div class="grid gap-2">
                <label class="text-sm font-medium">Subtitle</label>
                <Textarea v-model="local.subtitle" rows="2" placeholder="Short hero text or project tagline"
                  :disabled="!canMutate" />
              </div>

              <div class="grid gap-2">
                <label class="text-sm font-medium">Description</label>
                <Textarea v-model="local.description" rows="3"
                  placeholder="Short project description for listing or summary" :disabled="!canMutate" />
                <p v-if="fieldError('description')" class="text-sm text-destructive">
                  {{ fieldError("description") }}
                </p>
              </div>

              <div class="grid gap-2">
                <label class="text-sm font-medium">Overview</label>
                <Textarea v-model="local.overview" rows="5" placeholder="Detailed overview of the project"
                  :disabled="!canMutate" />
              </div>

              <div class="grid gap-2">
                <label class="text-sm font-medium">Highlights</label>
                <Textarea v-model="local.highlights_text" rows="4" placeholder="One highlight per line"
                  :disabled="!canMutate" />
                <p class="text-xs text-muted-foreground">
                  Example: write one highlight per line. It will be saved as JSON array.
                </p>
              </div>
            </div>
          </div>

          <div class="rounded-xl border p-4">
            <div class="mb-4">
              <h3 class="font-semibold">Map Coordinates</h3>
              <p class="text-xs text-muted-foreground">
                Optional latitude and longitude for project location map.
              </p>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <div class="grid gap-2">
                <label class="text-sm font-medium">Latitude</label>
                <Input v-model="local.latitude" placeholder="-2.5489" :disabled="!canMutate" />
              </div>

              <div class="grid gap-2">
                <label class="text-sm font-medium">Longitude</label>
                <Input v-model="local.longitude" placeholder="121.5678" :disabled="!canMutate" />
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between rounded-xl border p-4">
            <div>
              <p class="text-sm font-medium">Published</p>
              <p class="text-xs text-muted-foreground">
                Make this project visible on public website.
              </p>
            </div>

            <input v-model="local.is_published" type="checkbox" class="h-4 w-4" :disabled="!canMutate" />
          </div>

          <div class="rounded-xl border p-4">
            <div class="mb-4">
              <h3 class="font-semibold">SEO Metadata</h3>
              <p class="text-xs text-muted-foreground">
                Optional metadata for search engine preview.
              </p>
            </div>

            <div class="grid gap-4">
              <div class="grid gap-2">
                <label class="text-sm font-medium">SEO Title</label>
                <Input v-model="local.seo_title" placeholder="SEO title" :disabled="!canMutate" />
              </div>

              <div class="grid gap-2">
                <label class="text-sm font-medium">SEO Description</label>
                <Textarea v-model="local.seo_description" rows="3" placeholder="SEO description"
                  :disabled="!canMutate" />
              </div>
            </div>
          </div>

          <p v-if="fieldError('non_field_errors')" class="text-sm text-destructive">
            {{ fieldError("non_field_errors") }}
          </p>

          <p v-if="fieldError('detail')" class="text-sm text-destructive">
            {{ fieldError("detail") }}
          </p>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="close">
          Cancel
        </Button>

        <Button v-if="canMutate" :disabled="loading || !local.title.trim()" @click="submit">
          {{ loading ? "Saving..." : "Save Project" }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>