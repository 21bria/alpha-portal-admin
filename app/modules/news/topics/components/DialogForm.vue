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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import SelectLookup from "@/components/AsyncLookupSelect.vue"

type UserRole =
  | "SYSTEM"
  | "GLOBAL_VIEWER"
  | "ADMIN_USER"

type CategoryOption = {
  id: number
  name: string
  slug: string
}

type TagOption = {
  id: number
  name: string
  slug: string
}

export type NewsTopicPayload = {
  id?: number

  title: string

  slug?: string | null

  subtitle?: string | null

  category?: number | null

  tags?: number[]

  is_active?: boolean

  sort_order?: number
}

type NewsTopicFormState = {
  id?: number
  title: string
  slug: string
  subtitle: string
  category: number | null
  tags: number[]
  is_active: boolean
  sort_order: number
}

const props = defineProps<{
  open: boolean
  mode: "create" | "edit"
  role: UserRole
  initial?: Record<string, any> | null
  loading?: boolean
  errors?: Record<string, any> | null
  categories?: CategoryOption[]
  tags?: TagOption[]
}>()

const emit = defineEmits<{
  (e: "update:open", v: boolean): void
  (e: "submit", payload: NewsTopicPayload): void
}>()

const canMutate = computed(() => {
  return props.role !== "GLOBAL_VIEWER"
})

const dialogTitle = computed(() => {
  return props.mode === "create"
    ? "Add News Topic"
    : "Edit News Topic"
})

const categories = computed(() => {
  return props.categories || []
})

const tags = computed(() => {
  return props.tags || []
})

const local = ref<NewsTopicFormState>({
  id: undefined,
  title: "",
  slug: "",
  subtitle: "",
  category:null,
  tags: [],
  is_active: true,
  sort_order: 0,
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

function toggleTag(id: number) {
  if (local.value.tags.includes(id)) {
    local.value.tags = local.value.tags.filter(
      (item) => item !== id
    )

    return
  }

  local.value.tags.push(id)
}

function submit() {
  const payload: NewsTopicPayload = {
    id: local.value.id,
    title: local.value.title.trim(),
    slug: local.value.slug.trim(),  
    subtitle: local.value.subtitle.trim(),
    category: local.value.category,
    tags: local.value.tags,
    is_active: local.value.is_active,
    sort_order: Number( local.value.sort_order || 0),
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
      subtitle:props.initial?.subtitle ?? "",
      category: props.initial?.category ?? null,
      tags: props.initial?.tags ?? [],
      is_active:props.initial?.is_active ?? true,
      sort_order:props.initial?.sort_order ?? 0,
    }
  },
  { immediate: true }
)
</script>

<template>
  <Dialog :open="open" @update:open="(v) => emit('update:open', v)">
    <DialogContent class="max-w-2xl">
      <DialogHeader>
        <DialogTitle>
          {{ dialogTitle }}
        </DialogTitle>
      </DialogHeader>

      <div class="grid gap-5 py-2">
        <!-- title -->
        <div class="grid gap-2">
          <label class="text-sm font-medium">
            Topic Title
          </label>

          <Input v-model="local.title" placeholder="Example: ESG News" :disabled="!canMutate" />

          <p v-if="fieldError('title')" class="text-sm text-destructive">
            {{ fieldError("title") }}
          </p>
        </div>

        <!-- slug -->
        <div class="grid gap-2">
          <label class="text-sm font-medium">
            Slug
          </label>

          <Input v-model="local.slug" placeholder="Auto generated if empty" :disabled="!canMutate" />

          <p class="text-xs text-muted-foreground">
            Leave empty to auto-generate
            from topic title.
          </p>

          <p v-if="fieldError('slug')" class="text-sm text-destructive">
            {{ fieldError("slug") }}
          </p>
        </div>

        <!-- subtitle -->
        <div class="grid gap-2">
          <label class="text-sm font-medium">
            Subtitle
          </label>

          <Textarea v-model="local.subtitle" rows="3" placeholder="Short description for topic page"
            :disabled="!canMutate" />

          <p v-if="fieldError('subtitle')" class="text-sm text-destructive">
            {{ fieldError("subtitle") }}
          </p>
        </div>

        <!-- category -->
        <div class="grid gap-2">
          <label class="text-sm font-medium">
            Category
          </label>

          <SelectLookup
            v-model="local.category"
            label="Category"
            endpoint="/api/cms/news-categories/"
            label-key="name"
            value-key="id"
            placeholder="Select category"
            :disabled="!canMutate"
          />

          <p
            v-if="fieldError('category')"
            class="text-sm text-destructive"
          >
            {{ fieldError("category") }}
          </p>
        </div>

        <!-- tags -->
        <div class="grid gap-2">
          <label class="text-sm font-medium">
            Tags
          </label>

          <div class="flex flex-wrap gap-2">
            <button v-for="tag in tags" :key="tag.id" type="button"
              class="rounded-full border px-3 py-1 text-sm transition" :class="local.tags.includes(tag.id)
                  ? 'border-amber-400 bg-amber-400/10 text-amber-600'
                  : 'border-zinc-200 text-zinc-600 hover:border-amber-300'
                " @click="toggleTag(tag.id)">
              {{ tag.name }}
            </button>
          </div>

          <p v-if="fieldError('tags')" class="text-sm text-destructive">
            {{ fieldError("tags") }}
          </p>
        </div>

        <!-- sort -->
        <div class="grid gap-2">
          <label class="text-sm font-medium">
            Sort Order
          </label>

          <Input v-model="local.sort_order" type="number" :disabled="!canMutate" />

          <p v-if="fieldError('sort_order')" class="text-sm text-destructive">
            {{ fieldError("sort_order") }}
          </p>
        </div>

        <!-- active -->
        <label class="flex items-center gap-3">
          <input v-model="local.is_active" type="checkbox" :disabled="!canMutate" />

          <span class="text-sm font-medium">
            Active Topic
          </span>
        </label>

        <!-- global errors -->
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

        <Button v-if="canMutate" :disabled="loading ||
          !local.title.trim()
          " @click="submit">
          {{
            loading
              ? "Saving..."
              : "Save Topic"
          }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>