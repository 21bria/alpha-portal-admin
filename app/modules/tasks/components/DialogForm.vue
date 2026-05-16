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

export type TaskPayload = {
  id?: number
  slug?: string

  title: string
  description?: string

  location?: string
  department?: string

  status: "backlog" | "todo" | "in_progress" | "done" | "canceled"
  priority: "low" | "medium" | "high" | "urgent"

  assigned_to?: string

  start_date?: string | null
  due_date?: string | null

  checklist?: string[]
  attachments?: any[]

  is_public?: boolean
}

type TaskFormState = {
  id?: number
  slug?: string

  title: string
  description: string

  location: string
  department: string

  status: "backlog" | "todo" | "in_progress" | "done" | "canceled"
  priority: "low" | "medium" | "high" | "urgent"

  assigned_to: string

  start_date: string
  due_date: string

  checklist: string[]

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
  (e: "submit", payload: TaskPayload): void
}>()

const canMutate = computed(() => props.role !== "GLOBAL_VIEWER")

const title = computed(() =>
  props.mode === "create"
    ? "Add Task"
    : "Edit Task"
)

const local = ref<TaskFormState>({
  id: undefined,
  slug: undefined,

  title: "",
  description: "",

  location: "",
  department: "",

  status: "todo",
  priority: "medium",

  assigned_to: "",

  start_date: "",
  due_date: "",

  checklist: [],

  is_public: false,
})

function fieldError(key: string) {
  const e = props.errors?.[key]
  return Array.isArray(e) ? e[0] : e ?? null
}

function close() {
  emit("update:open", false)
}

function addChecklist() {
  local.value.checklist.push("")
}

function removeChecklist(index: number) {
  local.value.checklist.splice(index, 1)
}

function submit() {
  const payload: TaskPayload = {
    id: local.value.id,
    slug: local.value.slug,

    title: local.value.title.trim(),
    description: local.value.description.trim(),

    location: local.value.location.trim(),
    department: local.value.department.trim(),

    status: local.value.status,
    priority: local.value.priority,

    assigned_to: local.value.assigned_to.trim(),

    start_date: local.value.start_date || null,
    due_date: local.value.due_date || null,

    checklist: local.value.checklist
      .map((item) => item.trim())
      .filter(Boolean),

    is_public: local.value.is_public,
  }

  emit("submit", payload)
}

watch(
  () => props.open,
  (open) => {
    if (!open) return

    local.value = {
      id: props.initial?.id,
      slug: props.initial?.slug,

      title: props.initial?.title ?? "",
      description: props.initial?.description ?? "",

      location: props.initial?.location ?? "",
      department: props.initial?.department ?? "",

      status: props.initial?.status ?? "todo",
      priority: props.initial?.priority ?? "medium",

      assigned_to: props.initial?.assigned_to ?? "",

      start_date: props.initial?.start_date ?? "",
      due_date: props.initial?.due_date ?? "",

      checklist: props.initial?.checklist ?? [],

      is_public: props.initial?.is_public ?? false,
    }
  },
  { immediate: true }
)
</script>

<template>
  <Dialog :open="open" @update:open="(v) => emit('update:open', v)">
    <DialogContent class="max-h-[90vh] sm:max-w-5xl overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
      </DialogHeader>

      <div class="grid gap-6 py-2">
        <div class="grid gap-6 lg:grid-cols-2">
          <!-- LEFT -->
          <div class="space-y-5 rounded-2xl border border-zinc-200 p-5">
            <h3 class="text-sm font-semibold">
              Task Information
            </h3>

            <div class="grid gap-2">
              <label class="text-sm font-medium">
                Task Title
              </label>

              <Input
                v-model="local.title"
                placeholder="Example: Weekly site inspection"
                :disabled="!canMutate"
              />

              <p v-if="fieldError('title')" class="text-sm text-destructive">
                {{ fieldError("title") }}
              </p>
            </div>

            <div class="grid gap-2">
              <label class="text-sm font-medium">
                Description
              </label>

              <Textarea
                v-model="local.description"
                rows="5"
                placeholder="Describe the task, agenda, or activity plan"
                :disabled="!canMutate"
              />

              <p v-if="fieldError('description')" class="text-sm text-destructive">
                {{ fieldError("description") }}
              </p>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <div class="grid gap-2">
                <label class="text-sm font-medium">
                  Department
                </label>

                <Input
                  v-model="local.department"
                  placeholder="Operations"
                  :disabled="!canMutate"
                />
              </div>

              <div class="grid gap-2">
                <label class="text-sm font-medium">
                  Location
                </label>

                <Input
                  v-model="local.location"
                  placeholder="Site Gebe / Jakarta"
                  :disabled="!canMutate"
                />
              </div>
            </div>

            <div class="grid gap-2">
              <label class="text-sm font-medium">
                Assigned To
              </label>

              <Input
                v-model="local.assigned_to"
                placeholder="PIC / Team name"
                :disabled="!canMutate"
              />
            </div>
          </div>

          <!-- RIGHT -->
          <div class="space-y-5 rounded-2xl border border-zinc-200 p-5">
            <h3 class="text-sm font-semibold">
              Status & Schedule
            </h3>

            <div class="grid gap-4 md:grid-cols-2">
              <div class="grid gap-2">
                <label class="text-sm font-medium">
                  Status
                </label>

                <select
                  v-model="local.status"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  :disabled="!canMutate"
                >
                  <option value="backlog">Backlog</option>
                  <option value="todo">Todo</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                  <option value="canceled">Canceled</option>
                </select>
              </div>

              <div class="grid gap-2">
                <label class="text-sm font-medium">
                  Priority
                </label>

                <select
                  v-model="local.priority"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  :disabled="!canMutate"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div class="grid gap-4 md:grid-cols-2">
              <div class="grid gap-2">
                <label class="text-sm font-medium">
                  Start Date
                </label>

                <Input
                  v-model="local.start_date"
                  type="date"
                  :disabled="!canMutate"
                />
              </div>

              <div class="grid gap-2">
                <label class="text-sm font-medium">
                  Due Date
                </label>

                <Input
                  v-model="local.due_date"
                  type="date"
                  :disabled="!canMutate"
                />
              </div>
            </div>

            <label class="flex items-center justify-between rounded-xl border p-3">
              <div>
                <p class="text-sm font-medium">
                  Public Activity
                </p>

                <p class="text-xs text-muted-foreground">
                  Reserved for future public agenda/activity page.
                </p>
              </div>

              <input
                v-model="local.is_public"
                type="checkbox"
                class="h-4 w-4"
                :disabled="!canMutate"
              />
            </label>
          </div>
        </div>

        <!-- CHECKLIST -->
        <div class="space-y-5 rounded-2xl border border-zinc-200 p-5">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-semibold">
                Checklist
              </h3>

              <p class="mt-1 text-xs text-muted-foreground">
                Add checklist items for task execution or activity preparation.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              :disabled="!canMutate"
              @click="addChecklist"
            >
              + Add
            </Button>
          </div>

          <div class="grid gap-3">
            <div
              v-for="(_, index) in local.checklist"
              :key="index"
              class="flex gap-2"
            >
              <Input
                v-model="local.checklist[index]"
                placeholder="Example: Prepare safety briefing document"
                :disabled="!canMutate"
              />

              <Button
                type="button"
                variant="outline"
                :disabled="!canMutate"
                @click="removeChecklist(index)"
              >
                Remove
              </Button>
            </div>

            <div
              v-if="!local.checklist.length"
              class="rounded-xl border border-dashed p-5 text-sm text-muted-foreground"
            >
              No checklist item added yet.
            </div>
          </div>

          <p v-if="fieldError('checklist')" class="text-sm text-destructive">
            {{ fieldError("checklist") }}
          </p>
        </div>

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
          :disabled="loading || !local.title.trim()"
          @click="submit"
        >
          {{ loading ? "Saving..." : "Save Task" }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>