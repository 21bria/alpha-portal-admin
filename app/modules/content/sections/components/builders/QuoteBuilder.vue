<script setup lang="ts">
const model = defineModel<Record<string, any>>({ default: {} })

function update(key: string, value: any) {
  model.value = {
    ...model.value,
    [key]: value,
  }
}
</script>

<template>
  <div class="grid gap-4 rounded-2xl border p-5">
    <h3 class="font-semibold">Quote Builder</h3>

    <div class="grid gap-2">
      <label class="text-sm font-medium">Quote</label>
      <Textarea
        :model-value="model.quote ?? ''"
        rows="4"
        placeholder="Write quote here..."
        @update:model-value="update('quote', $event)"
      />
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div class="grid gap-2">
        <label class="text-sm font-medium">Author</label>
        <Input
          :model-value="model.author ?? ''"
          placeholder="Author name"
          @update:model-value="update('author', $event)"
        />
      </div>

      <div class="grid gap-2">
        <label class="text-sm font-medium">Position</label>
        <Input
          :model-value="model.position ?? ''"
          placeholder="CEO / Director"
          @update:model-value="update('position', $event)"
        />
      </div>
    </div>
  </div>
</template>