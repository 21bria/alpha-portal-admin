<script setup lang="ts">
const model = defineModel<Record<string, any>>({
  default: {
    eyebrow: "",
    items: [],
  },
})

function items() {
  return Array.isArray(model.value.items)
    ? model.value.items
    : []
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
      metric: "",
      title: "",
      description: "",
      icon: "",
      url: "",
    },
  ])
}

function removeItem(index: number) {
  sync(
    items().filter((_, i) => i !== Number(index))
  )
}

function updateItem(
  index: number,
  key: string,
  value: any
) {
  const next = [...items()]

  next[index] = {
    ...next[index],
    [key]: value,
  }

  sync(next)
}
</script>

<template>
  <div class="grid gap-4 rounded-2xl border p-5">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="font-semibold">
          Cards Builder
        </h3>

        <p class="text-xs text-muted-foreground">
          Add cards for operational blocks,
          services, or features.
        </p>
      </div>

      <Button type="button" variant="outline" size="sm" @click="addItem">
        + Add Card
      </Button>
    </div>

    <div class="grid gap-2">
      <label class="text-sm font-medium">
        Eyebrow
      </label>

      <Input :model-value="model.eyebrow ?? ''" placeholder="Operational Excellence"
        @update:model-value="model.eyebrow = $event" />
    </div>

    <div v-for="(item, index) in items()" :key="index" class="grid gap-4 rounded-xl border p-4">
      <div class="flex items-center justify-between">
        <p class="text-sm font-semibold">
          Card {{ Number(index) + 1 }}
        </p>

        <Button type="button" variant="ghost" size="sm" class="text-destructive" @click="removeItem(Number(index))">
          Remove
        </Button>
      </div>

      <div class="grid gap-3">
        <Input :model-value="item.metric" placeholder="01 / Production" @update:model-value="
          updateItem(
            Number(index),
            'metric',
            $event
          )
          " />

        <Input :model-value="item.title" placeholder="Mine Production" @update:model-value="
          updateItem(
            Number(index),
            'title',
            $event
          )
          " />

        <Textarea :model-value="item.description" rows="3" placeholder="Card description" @update:model-value="
          updateItem(
            Number(index),
            'description',
            $event
          )
          " />

        <Input :model-value="item.icon" placeholder="Icon name, optional" @update:model-value="
          updateItem(
            Number(index),
            'icon',
            $event
          )
          " />

        <Input :model-value="item.url" placeholder="/optional-url" @update:model-value="
          updateItem(
            Number(index),
            'url',
            $event
          )
          " />
      </div>
    </div>

    <div v-if="!items().length" class="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
      No cards yet. Click Add Card.
    </div>
  </div>
</template>