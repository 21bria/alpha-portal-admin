<script setup lang="ts">
const api = useApi()
const config = useRuntimeConfig()

const model = defineModel<Record<string, any>>({
  default: {
    eyebrow: "",
    variant: "default",
    primary_button_text: "",
    primary_button_url: "",
    secondary_button_text: "",
    secondary_button_url: "",
    images: [],
  },
})

function update(key: string, value: any) {
  model.value = {
    ...model.value,
    [key]: value,
  }
}

function images() {
  return Array.isArray(model.value.images) ? model.value.images : []
}

function syncImages(nextImages: any[]) {
  update("images", nextImages)
}

function addImage() {
  syncImages([
    ...images(),
    {
      url: "",
      title: "",
      description: "",
    },
  ])
}

function removeImage(index: number) {
  syncImages(images().filter((_, i) => i !== Number(index)))
}

function updateImage(index: number, key: string, value: any) {
  const next = [...images()]

  next[index] = {
    ...next[index],
    [key]: value,
  }

  syncImages(next)
}

async function uploadImage(index: number, event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  const fd = new FormData()
  fd.append("file", file)
  fd.append("folder", "career")

  const token = useCookie("access").value

  // const res: any = await $fetch(
  //   `${config.public.apiBaseUrl}/api/cms/section-images/upload/`,
  //   {
  //     method: "POST",
  //     body: fd,
  //     headers: token
  //       ? {
  //         Authorization: `Bearer ${token}`,
  //       }
  //       : {},
  //   }
  // )
  const res: any = await api.request("api/cms/section-images/upload/", {
  method: "POST",
  body: fd,
})

  updateImage(index, "url", res.url)
}
</script>

<template>
  <div class="grid gap-4 rounded-2xl border p-5">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="font-semibold">Hero Settings</h3>
        <p class="text-xs text-muted-foreground">
          Manage hero label, buttons, variant, and optional image slider.
        </p>
      </div>

      <Button type="button" variant="outline" size="sm" @click="addImage">
        + Add Image
      </Button>
    </div>

    <div class="grid gap-2">
      <label class="text-sm font-medium">Variant</label>

      <select :value="model.variant ?? 'default'" class="h-10 rounded-md border bg-background px-3 text-sm"
        @change="update('variant', ($event.target as HTMLSelectElement).value)">
        <option value="default">Default Hero</option>
        <option value="career">Career Hero</option>
      </select>
    </div>

    <div class="grid gap-2">
      <label class="text-sm font-medium">Eyebrow</label>

      <Input :model-value="model.eyebrow ?? ''" placeholder="Example: Career"
        @update:model-value="update('eyebrow', $event)" />
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div class="grid gap-2">
        <label class="text-sm font-medium">Primary Button Text</label>
        <Input :model-value="model.primary_button_text ?? ''" placeholder="View open positions"
          @update:model-value="update('primary_button_text', $event)" />
      </div>

      <div class="grid gap-2">
        <label class="text-sm font-medium">Primary Button URL</label>
        <Input :model-value="model.primary_button_url ?? ''" placeholder="/career"
          @update:model-value="update('primary_button_url', $event)" />
      </div>

      <div class="grid gap-2">
        <label class="text-sm font-medium">Secondary Button Text</label>
        <Input :model-value="model.secondary_button_text ?? ''" placeholder="Learn about us"
          @update:model-value="update('secondary_button_text', $event)" />
      </div>

      <div class="grid gap-2">
        <label class="text-sm font-medium">Secondary Button URL</label>
        <Input :model-value="model.secondary_button_url ?? ''" placeholder="/company/about"
          @update:model-value="update('secondary_button_url', $event)" />
      </div>
    </div>

    <div class="grid gap-4 rounded-2xl border p-5">
      <div>
        <h4 class="font-semibold">Hero Images</h4>
        <p class="text-xs text-muted-foreground">
          Optional image slider. Use Section Image as fallback.
        </p>
      </div>

      <div v-for="(image, index) in images()" :key="index" class="grid gap-3 rounded-xl border p-4">
        <div class="flex items-center justify-between">
          <p class="text-sm font-semibold">
            Image {{ Number(index) + 1 }}
          </p>

          <Button type="button" variant="ghost" size="sm" class="text-destructive" @click="removeImage(Number(index))">
            Remove
          </Button>
        </div>

        <input type="file" accept="image/*"
          class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          @change="uploadImage(Number(index), $event)" />

        <Input :model-value="image.url ?? ''" placeholder="Uploaded image URL" readonly />

        <Input :model-value="image.title ?? ''" placeholder="Image title"
          @update:model-value="updateImage(Number(index), 'title', $event)" />

        <Textarea :model-value="image.description ?? ''" rows="3" placeholder="Image description"
          @update:model-value="updateImage(Number(index), 'description', $event)" />

        <!-- <div v-if="image.url" class="overflow-hidden rounded-xl border bg-muted">
          <img :src="image.url" :alt="image.title || 'Hero image'" class="aspect-video w-full object-cover" />
        </div> -->
        <div
          v-if="image.url"
          class="overflow-hidden rounded-2xl border bg-muted"
        >
          <img
            :src="image.url"
            :alt="image.title || 'Hero image'"
            class="h-140 w-full object-cover transition duration-500 hover:scale-[1.01]"
          />
        </div>
      </div>

      <div v-if="!images().length"
        class="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
        No hero images yet. Click Add Image.
      </div>
    </div>
  </div>
</template>