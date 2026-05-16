<script setup lang="ts">
const model = defineModel<Record<string, any>>({
  default: { items: [] },
})

function items() {
  return Array.isArray(model.value.items) ? model.value.items : []
}

function sync(nextItems: any[]) {
  model.value = {
    ...model.value,
    items: nextItems,
  }
}

function addItem() {
  sync([
    ...items(),
    {
      label: "",
      title: "",
      description: "",
      points: [""],
    },
  ])
}

function removeItem(index: number) {
  sync(items().filter((_, i) => i !== index))
}

function updateItem(index: number, key: string, value: any) {
  const next = [...items()]
  next[index] = {
    ...next[index],
    [key]: value,
  }
  sync(next)
}

function addPoint(index: number) {
  const item = items()[index]
  updateItem(index, "points", [...(item.points ?? []), ""])
}

function updatePoint(index: number, pointIndex: number, value: string) {
  const item = items()[index]
  const points = [...(item.points ?? [])]
  points[pointIndex] = value
  updateItem(index, "points", points)
}

function removePoint(index: number, pointIndex: number) {
  const item = items()[index]
  const points = [...(item.points ?? [])].filter((_, i) => i !== pointIndex)
  updateItem(index, "points", points)
}
</script>

<template>
  <div class="grid gap-4 rounded-2xl border p-5">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="font-semibold">Values Builder</h3>
        <p class="text-xs text-muted-foreground">
          Use for mission, vision, core values, ESG values, or culture.
        </p>
      </div>

      <Button type="button" variant="outline" size="sm" @click="addItem">
        + Add Value
      </Button>
    </div>

    <div v-for="(item, index) in items()" :key="index" class="grid gap-4 rounded-xl border p-4">
      <div class="flex items-center justify-between">
        <p class="text-sm font-semibold">Value {{ index + 1 }}</p>

        <Button type="button" variant="ghost" size="sm" class="text-destructive" @click="removeItem(index)">
          Remove
        </Button>
      </div>

      <Input :model-value="item.label" placeholder="G" @update:model-value="updateItem(index, 'label', $event)" />

      <Input :model-value="item.title" placeholder="Growth" @update:model-value="updateItem(index, 'title', $event)" />

      <Textarea :model-value="item.description" rows="3" placeholder="Short value description"
        @update:model-value="updateItem(index, 'description', $event)" />

      <div class="grid gap-2">
        <div class="flex items-center justify-between">
          <label class="text-sm font-medium">Points</label>
          <Button type="button" variant="outline" size="sm" @click="addPoint(index)">
            + Add Point
          </Button>
        </div>
        <div
          v-for="(point, pointIndex) in item.points ?? []"
          :key="pointIndex"
          class="flex gap-2">
          <Input
            :model-value="point"
            placeholder="Value point"
            @update:model-value="updatePoint(index, Number(pointIndex), String($event))"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            class="text-destructive"
            @click="removePoint(index, Number(pointIndex))">
            Remove
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>