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

type UserRole = "SYSTEM" | "GLOBAL_VIEWER" | "ADMIN_USER"

export type NewsTagPayload = {
  id?: number
  name: string
  slug?: string | null
}

type NewsTagFormState = {
  id?: number
  name: string
  slug: string
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
  (e: "submit", payload: NewsTagPayload): void
}>()

const canMutate = computed(() => props.role !== "GLOBAL_VIEWER")

const title = computed(() =>
  props.mode === "create" ? "Add News Tag" : "Edit News Tag"
)

const local = ref<NewsTagFormState>({
  id: undefined,
  name: "",
  slug: "",
})

function fieldError(key: string) {
  const e = props.errors?.[key]
  return Array.isArray(e) ? e[0] : e ?? null
}

function close() {
  emit("update:open", false)
}

function submit() {
  const payload: NewsTagPayload = {
    id: local.value.id,
    name: local.value.name.trim(),
    slug: local.value.slug.trim() || "",
  }

  emit("submit", payload)
}

watch(
  () => props.open,
  (open) => {
    if (!open) return

    local.value = {
      id: props.initial?.id,
      name: props.initial?.name ?? "",
      slug: props.initial?.slug ?? "",
    }
  },
  { immediate: true }
)
</script>

<template>
  <Dialog :open="open" @update:open="(v) => emit('update:open', v)">
    <DialogContent class="max-w-xl">
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
      </DialogHeader>

      <div class="grid gap-4 py-2">
        <div class="grid gap-2">
          <label class="text-sm font-medium">Tag Name</label>

          <Input
            v-model="local.name"
            placeholder="Example: Nickel, ESG, Production"
            :disabled="!canMutate"
          />

          <p v-if="fieldError('name')" class="text-sm text-destructive">
            {{ fieldError("name") }}
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
            Leave empty to auto-generate from tag name.
          </p>

          <p v-if="fieldError('slug')" class="text-sm text-destructive">
            {{ fieldError("slug") }}
          </p>
        </div>

        <p v-if="fieldError('non_field_errors')" class="text-sm text-destructive">
          {{ fieldError("non_field_errors") }}
        </p>

        <p v-if="fieldError('detail')" class="text-sm text-destructive">
          {{ fieldError("detail") }}
        </p>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="close">
          Cancel
        </Button>

        <Button
          v-if="canMutate"
          :disabled="loading || !local.name.trim()"
          @click="submit"
        >
          {{ loading ? "Saving..." : "Save" }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>