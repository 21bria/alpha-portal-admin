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

export type PagePayload = {
  id?: number
  title: string
  slug?: string
  subtitle?: string
  description?: string
  is_published: boolean
  seo_title?: string
  seo_description?: string
}

type PageFormState = {
  id?: number
  title: string
  slug: string
  subtitle: string
  description: string
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
  (e: "submit", payload: PagePayload): void
}>()

const canMutate = computed(() => props.role !== "GLOBAL_VIEWER")

const title = computed(() =>
  props.mode === "create" ? "Add Page" : "Edit Page"
)

const local = ref<PageFormState>({
  id: undefined,
  title: "",
  slug: "",
  subtitle: "",
  description: "",
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

function submit() {
  const payload: PagePayload = {
    id: local.value.id,
    title: local.value.title.trim(),
    slug: local.value.slug.trim() || "",
    subtitle: local.value.subtitle.trim(),
    description: local.value.description.trim(),
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

    local.value = {
      id: props.initial?.id,
      title: props.initial?.title ?? "",
      slug: props.initial?.slug ?? "",
      subtitle: props.initial?.subtitle ?? "",
      description: props.initial?.description ?? "",
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
    <DialogContent
      class="flex max-h-[90vh] flex-col overflow-hidden sm:max-w-2xl"
    >
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
      </DialogHeader>

      <div class="overflow-y-auto py-2">
        <div class="grid gap-4 py-2">
          <div class="grid gap-2">
            <label class="text-sm font-medium">Page Title</label>
            <Input
              v-model="local.title"
              placeholder="Example: Home, About Us, Services"
              :disabled="!canMutate"
            />
            <p v-if="fieldError('title')" class="text-sm text-destructive">
              {{ fieldError("title") }}
            </p>
          </div>

          <div class="grid gap-2">
            <label class="text-sm font-medium">Slug</label>
            <Input
              v-model="local.slug"
              placeholder="Auto generated if empty"
              :disabled="!canMutate"
            />
            <p class="text-xs text-muted-foreground">
              Leave empty to auto-generate from page title.
            </p>
            <p v-if="fieldError('slug')" class="text-sm text-destructive">
              {{ fieldError("slug") }}
            </p>
          </div>

          <div class="grid gap-2">
            <label class="text-sm font-medium">
              Subtitle
            </label>

            <Textarea
              v-model="local.subtitle"
              rows="2"
              placeholder="Short hero or banner text"
              :disabled="!canMutate"
            />

            <p class="text-xs text-muted-foreground">
              Displayed in hero section or page banner.
            </p>

            <p
              v-if="fieldError('subtitle')"
              class="text-sm text-destructive"
            >
              {{ fieldError("subtitle") }}
            </p>
          </div>

          <div class="grid gap-2">
            <label class="text-sm font-medium">Description</label>
            <Textarea
              v-model="local.description"
              rows="3"
              placeholder="Short page description"
              :disabled="!canMutate"
            />
            <p v-if="fieldError('description')" class="text-sm text-destructive">
              {{ fieldError("description") }}
            </p>
          </div>

          <div class="flex items-center justify-between rounded-xl border p-3">
            <div>
              <p class="text-sm font-medium">Published</p>
              <p class="text-xs text-muted-foreground">
                Make this page visible on public portal.
              </p>
            </div>

            <input
              v-model="local.is_published"
              type="checkbox"
              class="h-4 w-4"
              :disabled="!canMutate"
            />
          </div>

          <div class="rounded-xl border p-4">
            <div class="grid gap-4">
              <h3 class="font-semibold">SEO Metadata</h3>

              <div class="grid gap-2">
                <label class="text-sm font-medium">SEO Title</label>
                <Input
                  v-model="local.seo_title"
                  placeholder="SEO title"
                  :disabled="!canMutate"
                />
              </div>

              <div class="grid gap-2">
                <label class="text-sm font-medium">SEO Description</label>
                <Textarea
                  v-model="local.seo_description"
                  rows="3"
                  placeholder="SEO description"
                  :disabled="!canMutate"
                />
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

        <Button
          v-if="canMutate"
          :disabled="loading || !local.title.trim()"
          @click="submit"
        >
          {{ loading ? "Saving..." : "Save" }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>