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
      image_url: "",
      title: "",
      description: "",
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
</script>

<template>
  <div class="grid gap-4 rounded-2xl border p-5">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="font-semibold">Gallery Builder</h3>
        <p class="text-xs text-muted-foreground">
          Add image URLs or media items for gallery sections.
        </p>
      </div>

      <Button type="button" variant="outline" size="sm" @click="addItem">
        + Add Image
      </Button>
    </div>

    <div
      v-for="(item, index) in items()"
      :key="index"
      class="grid gap-4 rounded-xl border p-4"
    >
      <div class="flex items-center justify-between">
        <p class="text-sm font-semibold">Image {{ index + 1 }}</p>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          class="text-destructive"
          @click="removeItem(index)"
        >
          Remove
        </Button>
      </div>

      <Input
        :model-value="item.image_url"
        placeholder="/media/pages/gallery/image.jpg"
        @update:model-value="updateItem(index, 'image_url', $event)"
      />

      <Input
        :model-value="item.title"
        placeholder="Image title"
        @update:model-value="updateItem(index, 'title', $event)"
      />

      <Textarea
        :model-value="item.description"
        rows="3"
        placeholder="Image description"
        @update:model-value="updateItem(index, 'description', $event)"
      />
    </div>
  </div>
</template>