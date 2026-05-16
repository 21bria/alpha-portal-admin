<script setup lang="ts">
import { ref, watch, computed } from "vue"
import { useApi } from "@/composables/useApi"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

type LookupItem = { value: number; label: string }
type ApiList<T> = { count: number; next: string | null; results: T[] }

const props = defineProps<{
  label: string
  endpoint: string
  depends?: Record<string, any>
  disabled?: boolean
  variant?: "compact" | "field"
  selectedLabel?: string | null
  valueKey?: string
  labelKey?: string
  allowNull?: boolean
  nullLabel?: string

  multiple?: boolean
}>()

const model = defineModel<number | number[] | null>({
  default: null
})
const { request } = useApi()

const open = ref(false)
const page = ref(1)
const loading = ref(false)
const items = ref<LookupItem[]>([])
const hasNext = ref(true)

const MIN_SEARCH = 2
const DEBOUNCE_MS = 300

const searchInput = ref("")
const searchQuery = ref("")
let debounceTimer: ReturnType<typeof setTimeout> | null = null

const isField = computed(() => (props.variant ?? "compact") === "field")
const valueKey = computed(() => props.valueKey ?? "id")
const labelKey = computed(() => props.labelKey ?? "name")
const allowNull = computed(() => props.allowNull ?? true)
const nullLabel = computed(() => props.nullLabel ?? (isField.value ? `Select ${props.label}` : "All"))

const dependsQuery = computed(() => {
  const d = props.depends || {}
  const q: Record<string, any> = {}
  for (const k of Object.keys(d)) {
    q[k] = (d[k]?.value ?? d[k]) ?? undefined
  }
  return q
})

const labelCache = ref<Record<number, string>>({})

function remember(it: LookupItem) {
  if (it?.value != null) {
    labelCache.value[it.value] = it.label
  }
}
const isMultiple = computed(() => props.multiple ?? false)

function isSelected(value: number) {
  if (isMultiple.value) {
    return Array.isArray(model.value)
      ? model.value.includes(value)
      : false
  }

  return model.value === value
}

function toggleValue(it: LookupItem) {
  remember(it)

  if (!isMultiple.value) {
    model.value = it.value
    open.value = false
    return
  }

  const current = Array.isArray(model.value)
    ? [...model.value]
    : []

  const exists = current.includes(it.value)

  if (exists) {
    model.value = current.filter(v => v !== it.value)
  } else {
    current.push(it.value)
    model.value = current
  }
}
function mapItem(raw: any): LookupItem {
  // const value = Number(raw?.value ?? raw?.[valueKey.value] ?? raw?.id)
  const value = raw?.value ?? raw?.[valueKey.value] ?? raw?.id
  const label = String(
    raw?.label ??
    raw?.[labelKey.value] ??
    raw?.name ??
    raw?.title ??
    raw?.code ??
    value
  )

  return { value, label }
}

watch(
  () => [model.value, props.selectedLabel] as const,
  ([value, lbl]) => {
    if (Array.isArray(value)) {
      return
    }

    if (value != null && lbl && !labelCache.value[value]) {
      labelCache.value[value] = lbl
    }
  },
  { immediate: true }
)
watch(
  () => model.value,
  (v) => {
    if (Array.isArray(v)) {
      v.forEach((id) => fetchLabelById(Number(id)))
      return
    }

    if (v != null) {
      fetchLabelById(Number(v))
    }
  },
  { immediate: true }
)

watch(dependsQuery, () => {
  items.value = []
  page.value = 1
  hasNext.value = true
  if (open.value) load(true)
})

async function fetchLabelById(id: number) {
  if (!id) return
  if (labelCache.value[id]) return

  try {
    const detail = await request<any>(`${props.endpoint}${id}/`, {
      method: "GET",
      query: {
        value_key: valueKey.value,
        label_key: labelKey.value,
      },
    })

    const mapped = mapItem(detail)
    remember(mapped)
    return
  } catch {
    try {
      const res = await request<ApiList<any>>(props.endpoint, {
        method: "GET",
        query: {
          page: 1,
          page_size: 1,
          id,
          value_key: valueKey.value,
          label_key: labelKey.value,
          ...dependsQuery.value,
        },
      })

      const raw = res?.results?.[0]
      if (raw) {
        const mapped = mapItem(raw)
        remember(mapped)
      }
    } catch {
      if (!labelCache.value[id] && props.selectedLabel) {
        labelCache.value[id] = props.selectedLabel
      }
    }
  }
}

async function load(reset = false) {
  if (props.disabled) return
  if (loading.value) return
  if (!hasNext.value && !reset) return

  loading.value = true
  try {
    const res = await request<ApiList<any>>(props.endpoint, {
      method: "GET",
      query: {
        page: page.value,
        page_size: 10,
        search: searchQuery.value || undefined,
        value_key: valueKey.value,
        label_key: labelKey.value,
        ...dependsQuery.value,
      },
    })

    hasNext.value = !!res?.next

    const newItems = (res?.results ?? [])
      .map(mapItem)
      .filter((it) => Number.isFinite(it.value))

    newItems.forEach(remember)
    items.value = reset ? newItems : [...items.value, ...newItems]
  } finally {
    loading.value = false
  }
}

function toggleOpen() {
  if (props.disabled) return
  open.value = !open.value
  if (open.value && items.value.length === 0) {
    load(true)
  }
}

function onScroll(e: Event) {
  const el = e.target as HTMLElement
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
    if (hasNext.value && !loading.value) {
      page.value += 1
      load()
    }
  }
}

watch(searchInput, (v) => {
  if (debounceTimer) clearTimeout(debounceTimer)

  const s = (v ?? "").trim()

  if (s.length > 0 && s.length < MIN_SEARCH) {
    items.value = []
    page.value = 1
    hasNext.value = false
    searchQuery.value = ""
    return
  }

  debounceTimer = setTimeout(() => {
    searchQuery.value = s
  }, DEBOUNCE_MS)
})

watch(searchQuery, () => {
  page.value = 1
  hasNext.value = true
  load(true)
})

const selectedLabel = computed(() => {
  if (isMultiple.value) {
    const values = Array.isArray(model.value)
      ? model.value
      : []

    if (!values.length) return undefined

    return values
      .map(v =>
        items.value.find(i => i.value === v)?.label ||
        labelCache.value[v]
      )
      .filter(Boolean)
      .join(", ")
  }

  const v = model.value

  if (v == null || Array.isArray(v)) {
    return undefined
  }

  return (
    items.value.find((i) => i.value === v)?.label ||
    labelCache.value[v] ||
    props.selectedLabel ||
    undefined
  )
})
</script>

<template>
  <div :class="isField ? 'relative w-full' : 'relative'">
    <Button type="button" variant="outline" :disabled="disabled" @click="toggleOpen" :class="[
      'h-9',
      isField ? 'w-full justify-between px-3' : '',
    ]">
      <span class="truncate">
        <template v-if="!isField">
          <span class="font-medium">{{ label }}:</span>
        </template>

        {{ model != null ? (selectedLabel ?? model) : nullLabel }}
      </span>

      <Icon name="i-radix-icons-chevron-down" class="ml-2 h-4 w-4 opacity-70" />
    </Button>

    <div v-if="open" :class="[
      'absolute z-50 mt-2 rounded-md border bg-background shadow',
      isField ? 'w-full' : 'w-[260px]'
    ]">
      <div class="p-2 border-b">
        <Input placeholder="Search..." v-model="searchInput" class="h-9" />
      </div>

      <div class="max-h-[240px] overflow-auto" @scroll="onScroll">
       <button
        v-if="allowNull"
        class="w-full text-left px-3 py-2 text-sm hover:bg-muted"
        type="button"
        @click="model = isMultiple ? [] : null; open = false">
        {{ nullLabel }}
      </button>

       <button
        v-for="it in items"
        :key="it.value"
        :class="[
          'w-full text-left px-3 py-2 text-sm hover:bg-muted',
          isSelected(it.value) ? 'bg-muted font-medium' : ''
        ]"
        type="button"
        @click="toggleValue(it)">
        <div class="flex items-center justify-between gap-2">
          <span class="truncate">
            {{ it.label }}
          </span>
          <span
            v-if="isSelected(it.value)"
            class="text-xs text-muted-foreground">
            ✓
          </span>
        </div>
      </button>
        <div v-if="searchInput.trim().length > 0 && searchInput.trim().length < MIN_SEARCH"
          class="px-3 py-2 text-xs text-muted-foreground">
          Type at least {{ MIN_SEARCH }} characters...
        </div>

        <div v-if="loading" class="px-3 py-2 text-xs text-muted-foreground">
          Loading...
        </div>

        <div v-else-if="!items.length" class="px-3 py-2 text-xs text-muted-foreground">
          No results
        </div>
      </div>
    </div>
  </div>
</template>