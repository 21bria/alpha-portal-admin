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

type UserRole =
  | "SYSTEM"
  | "GLOBAL_VIEWER"
  | "ADMIN_USER"

export type MediaAlbumPayload = {
  id?: number
  name: string
  slug?: string | null
  description?: string | null
  is_public?: boolean
}

type MediaAlbumFormState = {
  id?: number
  name: string
  slug: string
  description: string
  is_public: boolean
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
  (e: "submit", payload: MediaAlbumPayload): void
}>()

const canMutate = computed(() => {
  return props.role !== "GLOBAL_VIEWER"
})

const dialogTitle = computed(() => {
  return props.mode === "create"
    ? "Create Album"
    : "Edit Album"
})

const local = ref<MediaAlbumFormState>({
  id: undefined,
  name: "",
  slug: "",
  description: "",
  is_public: true,
})

function fieldError(key: string) {
  const e = props.errors?.[key]

  return Array.isArray(e)
    ? e[0]
    : e ?? null
}

function close() {
  emit("update:open", false)
}

function submit() {
  emit("submit", {
    id: local.value.id,
    name: local.value.name.trim(),
    slug: local.value.slug.trim(),
    description: local.value.description.trim(),
    is_public: local.value.is_public,
  })
}

watch(
  () => props.open,
  (open) => {
    if (!open) return

    local.value = {
      id: props.initial?.id,
      name: props.initial?.name ?? "",
      slug: props.initial?.slug ?? "",
      description: props.initial?.description ?? "",
      is_public: props.initial?.is_public ?? true,
    }
  },
  { immediate: true }
)
</script>

<template>
  <Dialog :open="open" @update:open="(v) => emit('update:open', v)">
    <DialogContent class="max-w-xl">
      <DialogHeader>
        <DialogTitle>
          {{ dialogTitle }}
        </DialogTitle>
      </DialogHeader>

      <div class="grid gap-5 py-2">
        <!-- name -->
        <div class="grid gap-2">
          <label class="text-sm font-medium">
            Album Name
          </label>

          <Input
            v-model="local.name"
            placeholder="Example: Company Event 2026"
            :disabled="!canMutate"
          />

          <p
            v-if="fieldError('name')"
            class="text-sm text-destructive"
          >
            {{ fieldError("name") }}
          </p>
        </div>

        <!-- slug -->
        <div class="grid gap-2">
          <label class="text-sm font-medium">
            Slug
          </label>

          <Input
            v-model="local.slug"
            placeholder="Auto generated if empty"
            :disabled="!canMutate"
          />

          <p class="text-xs text-muted-foreground">
            Leave empty to auto-generate from album name.
          </p>

          <p
            v-if="fieldError('slug')"
            class="text-sm text-destructive"
          >
            {{ fieldError("slug") }}
          </p>
        </div>

        <!-- description -->
        <div class="grid gap-2">
          <label class="text-sm font-medium">
            Description
          </label>

          <Textarea
            v-model="local.description"
            rows="4"
            placeholder="Album description..."
            :disabled="!canMutate"
          />

          <p
            v-if="fieldError('description')"
            class="text-sm text-destructive"
          >
            {{ fieldError("description") }}
          </p>
        </div>

        <!-- public -->
        <label class="flex items-center gap-3">
          <input
            v-model="local.is_public"
            type="checkbox"
            :disabled="!canMutate"
          />

          <span class="text-sm font-medium">
            Public Album
          </span>
        </label>

        <!-- global -->
        <p
          v-if="fieldError('non_field_errors')"
          class="text-sm text-destructive"
        >
          {{ fieldError("non_field_errors") }}
        </p>

        <p
          v-if="fieldError('detail')"
          class="text-sm text-destructive"
        >
          {{ fieldError("detail") }}
        </p>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="close">
          Cancel
        </Button>

        <Button
          v-if="canMutate"
          :disabled="
            loading ||
            !local.name.trim()
          "
          @click="submit"
        >
          {{
            loading
              ? "Saving..."
              : "Save Album"
          }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>