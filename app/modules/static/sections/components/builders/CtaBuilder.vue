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
    <h3 class="font-semibold">CTA Builder</h3>

    <div class="grid gap-2">
      <label class="text-sm font-medium">Eyebrow</label>
      <Input
        :model-value="model.eyebrow ?? ''"
        placeholder="Get in touch"
        @update:model-value="update('eyebrow', $event)"
      />
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div class="grid gap-2">
        <label class="text-sm font-medium">Button Text</label>
        <Input
          :model-value="model.button_text ?? ''"
          placeholder="Contact Us"
          @update:model-value="update('button_text', $event)"
        />
      </div>

      <div class="grid gap-2">
        <label class="text-sm font-medium">Button URL</label>
        <Input
          :model-value="model.button_url ?? ''"
          placeholder="/contact"
          @update:model-value="update('button_url', $event)"
        />
      </div>
    </div>
  </div>
</template>