<script setup lang="ts">
import { ref, watch, computed } from "vue"
import { useDebounceFn } from "@vueuse/core"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useApi } from "@/composables/useApi"

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select"

const { request } = useApi()

type UserRole = "SYSTEM" | "GLOBAL_VIEWER" | "ADMIN_USER" | "MANAGEMENT"

export type UserPayload = {
  id?: number
  username: string
  email: string
  first_name?: string | null
  last_name?: string | null
  is_active?: boolean
  role: string
  groups?: number[]
  password?: string
}

type UserFormState = {
  id?: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_active: boolean
  role: string
  groups: number[]
  password: string
}

const props = defineProps<{
  open: boolean
  mode: "create" | "edit"
  role: string
  initial?: Partial<UserPayload> | null
  loading?: boolean
  errors?: Record<string, any> | null
}>()

const emit = defineEmits<{
  (e: "update:open", v: boolean): void
  (e: "submit", payload: UserPayload): void
}>()

function normalizeRole(v: any): UserRole {
  const raw = String(v ?? "").trim().toUpperCase()

  if (["SYSTEM", "GLOBAL_VIEWER", "ADMIN_USER", "MANAGEMENT"].includes(raw)) {
    return raw as UserRole
  }

  if (raw === "SUPER_ADMIN" || raw === "SUPERADMIN" || raw === "ADMIN") {
    return "SYSTEM"
  }

  return "ADMIN_USER"
}

const currentRole = computed<UserRole>(() => normalizeRole(props.role))
const canMutate = computed(() => currentRole.value !== "GLOBAL_VIEWER")
const canAdminUser = computed(() => currentRole.value === "SYSTEM")

const local = ref<UserFormState>({
  username: "",
  email: "",
  first_name: "",
  last_name: "",
  is_active: true,
  role: "ADMIN_USER",
  groups: [],
  password: "",
})

const isTargetSystem = computed(() => local.value.role === "SYSTEM")
const showGroupsSection = computed(() => canAdminUser.value && !isTargetSystem.value)

const title = computed(() => (props.mode === "create" ? "Add User" : "Edit User"))
const close = () => emit("update:open", false)

function normalizeGroupIds(input: any): number[] {
  const arr = Array.isArray(input) ? input : []

  return arr
    .map((g) => Number(g && typeof g === "object" ? g.id ?? g.value ?? g.pk : g))
    .filter((n) => Number.isFinite(n))
}

const formErrors = ref<Record<string, string[]> | null>(null)

const fieldError = (key: string) => {
  const e = formErrors.value?.[key] ?? props.errors?.[key]
  if (!e) return null
  return Array.isArray(e) ? e[0] : String(e)
}

const GROUP_LOOKUP_URL = "/api/auth/groups/lookup"

const groupOptions = ref<Array<{ value: number; label: string }>>([])
const groupLoading = ref(false)
const groupSearch = ref("")
const groupPage = ref(1)
const groupHasMore = ref(true)
const groupContentRef = ref<HTMLElement | null>(null)

async function fetchGroups(q = "", page = 1) {
  if (groupLoading.value) return

  groupLoading.value = true

  try {
    const res: any = await request(GROUP_LOOKUP_URL, {
      method: "GET",
      query: {
        search: q,
        page,
        page_size: 10,
      },
    })

    const raw = Array.isArray(res) ? res : res?.results ?? []

    const mapped = raw
      .map((g: any) => ({
        value: Number(g.value ?? g.id ?? g.pk),
        label: String(g.label ?? g.name ?? g.title ?? g.value ?? g.id ?? g.pk),
      }))
      .filter((x: any) => Number.isFinite(x.value))

    const count = Array.isArray(res) ? mapped.length : Number(res?.count ?? 0)

    if (page === 1) {
      groupOptions.value = mapped
    } else {
      groupOptions.value = [...groupOptions.value, ...mapped]
    }

    groupPage.value = page
    groupHasMore.value = count ? groupOptions.value.length < count : false
  } finally {
    groupLoading.value = false
  }
}

const onGroupSearch = useDebounceFn((q: string) => {
  groupSearch.value = q
  groupPage.value = 1
  groupHasMore.value = true

  fetchGroups(q, 1).then(() => {
    if (groupContentRef.value) {
      groupContentRef.value.scrollTop = 0
    }
  })
}, 300)

function onGroupScroll(e: Event) {
  const el = e.target as HTMLElement
  const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 40

  if (nearBottom && groupHasMore.value && !groupLoading.value) {
    fetchGroups(groupSearch.value, groupPage.value + 1)
  }
}

function toggleGroup(v: number) {
  const set = new Set(local.value.groups)

  if (set.has(v)) {
    set.delete(v)
  } else {
    set.add(v)
  }

  local.value.groups = Array.from(set)
}

const submit = () => {
  formErrors.value = {}

  if (!local.value.username.trim()) {
    formErrors.value.username = ["Username is required"]
  }

  if (!local.value.email.trim()) {
    formErrors.value.email = ["Email is required"]
  }

  if (!local.value.role) {
    formErrors.value.role = ["Role is required"]
  }

  if (showGroupsSection.value && local.value.groups.length === 0) {
    formErrors.value.groups = ["At least one group is required"]
  }

  if (Object.keys(formErrors.value).length > 0) return

  const targetIsSystem = local.value.role === "SYSTEM"

  const payload: UserPayload = {
    id: local.value.id,
    username: local.value.username.trim(),
    email: local.value.email.trim(),
    first_name: local.value.first_name.trim(),
    last_name: local.value.last_name.trim(),
    is_active: local.value.is_active,
    role: local.value.role,
    groups: targetIsSystem
      ? []
      : local.value.groups.filter((n) => Number.isFinite(n)),
  }

  if (local.value.password.trim()) {
    payload.password = local.value.password.trim()
  }

  emit("submit", payload)
}

async function initForm() {
  const init = props.initial ?? {}

  local.value = {
    id: init.id,
    username: String(init.username ?? ""),
    email: String(init.email ?? ""),
    first_name: String(init.first_name ?? ""),
    last_name: String(init.last_name ?? ""),
    is_active: Boolean(init.is_active ?? true),
    role: String(init.role ?? "ADMIN_USER"),
    groups: normalizeGroupIds((init as any).groups),
    password: "",
  }
}

async function preloadLookups() {
  if (showGroupsSection.value) {
    groupSearch.value = ""
    groupPage.value = 1
    groupHasMore.value = true
    await fetchGroups("", 1)
  }
}

watch(
  () => [props.open, currentRole.value] as const,
  async ([open]) => {
    if (!open) return

    await initForm()
    await preloadLookups()
  },
  { immediate: true }
)

const selectedGroupLabels = computed(() => {
  const map = new Map(groupOptions.value.map((g) => [g.value, g.label]))

  return local.value.groups.map((id) => map.get(id) ?? String(id)).join(", ")
})
</script>

<template>
  <Dialog :open="open" @update:open="(v) => emit('update:open', v)">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle class="flex items-center justify-between gap-3">
          <span>{{ title }}</span>
          <span class="text-xs text-muted-foreground">
            role: {{ props.role }} → {{ currentRole }}
          </span>
        </DialogTitle>
      </DialogHeader>

      <div class="grid gap-4 py-2">
        <div class="grid gap-2">
          <label class="text-sm font-medium">Username</label>
          <Input v-model="local.username" :disabled="!canMutate" />
          <p v-if="fieldError('username')" class="text-sm text-destructive">
            {{ fieldError("username") }}
          </p>
        </div>

        <div class="grid gap-2">
          <label class="text-sm font-medium">Email</label>
          <Input v-model="local.email" type="email" :disabled="!canMutate" />
          <p v-if="fieldError('email')" class="text-sm text-destructive">
            {{ fieldError("email") }}
          </p>
        </div>

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div class="grid gap-2">
            <label class="text-sm font-medium">First name</label>
            <Input v-model="local.first_name" :disabled="!canMutate" />
          </div>

          <div class="grid gap-2">
            <label class="text-sm font-medium">Last name</label>
            <Input v-model="local.last_name" :disabled="!canMutate" />
          </div>
        </div>

        <div class="grid gap-2">
          <label class="text-sm font-medium">Role</label>

          <Select :model-value="local.role" :disabled="!canAdminUser" @update:model-value="(v) => (local.role = v)">
            <SelectTrigger class="h-9">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>

            <SelectContent>
              <SelectGroup>
                <SelectItem value="SYSTEM">SYSTEM</SelectItem>
                <SelectItem value="MANAGEMENT">MANAGEMENT</SelectItem>
                <SelectItem value="ADMIN_USER">ADMIN_USER</SelectItem>
                <SelectItem value="GLOBAL_VIEWER">GLOBAL_VIEWER</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <p v-if="fieldError('role')" class="text-sm text-destructive">
            {{ fieldError("role") }}
          </p>
        </div>

        <div v-if="showGroupsSection" class="grid gap-2">
          <label class="text-sm font-medium">Groups</label>

          <Select :model-value="''" :disabled="groupLoading || !canMutate">
            <SelectTrigger class="h-9">
              <SelectValue :placeholder="groupLoading ? 'Loading...' : 'Add / remove groups'" />
            </SelectTrigger>

            <SelectContent ref="groupContentRef" class="max-h-80 overflow-auto" @scroll="onGroupScroll">
              <SelectGroup>
                <div class="sticky top-0 z-10 border-b bg-background/30 p-2 backdrop-blur">
                  <Input v-model="groupSearch" placeholder="Search group..." class="h-8"
                    @input="onGroupSearch(groupSearch)" @keydown.stop @click.stop />
                </div>

                <div class="space-y-2 p-2">
                  <div v-for="g in groupOptions" :key="g.value" class="flex items-center gap-2" @mousedown.stop
                    @click.stop>
                    <Checkbox :model-value="local.groups.includes(g.value)" :disabled="!canMutate"
                      @update:model-value="() => toggleGroup(g.value)" />

                    <span class="text-sm">{{ g.label }}</span>
                  </div>

                  <div v-if="groupLoading" class="text-sm text-muted-foreground">
                    Loading...
                  </div>

                  <div v-if="!groupLoading && groupOptions.length === 0" class="text-sm text-muted-foreground">
                    No results
                  </div>
                </div>
              </SelectGroup>
            </SelectContent>
          </Select>

          <p v-if="local.groups.length" class="text-xs text-muted-foreground">
            Selected:
            <span class="font-medium">{{ selectedGroupLabels }}</span>
          </p>

          <p v-if="fieldError('groups')" class="text-sm text-destructive">
            {{ fieldError("groups") }}
          </p>
        </div>

        <label class="flex items-center gap-2 text-sm">
          <Checkbox :model-value="local.is_active" :disabled="!canMutate"
            @update:model-value="(v) => (local.is_active = v === true)" />
          Active
        </label>

        <p v-if="fieldError('detail')" class="text-sm text-destructive">
          {{ fieldError("detail") }}
        </p>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="close">
          Cancel
        </Button>

        <Button v-if="canMutate" :disabled="props.loading || !local.username.trim() || !local.email.trim()"
          @click="submit">
          {{ props.loading ? "Saving..." : "Save" }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>