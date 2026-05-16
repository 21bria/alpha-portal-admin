<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"
import Editor from "@tinymce/tinymce-vue"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import SelectLookup from "@/components/AsyncLookupSelect.vue"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import { useApi } from "@/composables/useApi"
import { useNotify } from "@/composables/useNotify"

import HeroBuilder from "./builders/HeroBuilder.vue"
import CardsBuilder from "./builders/CardsBuilder.vue"
import ValuesBuilder from "./builders/ValuesBuilder.vue"
import QuoteBuilder from "./builders/QuoteBuilder.vue"
import GalleryBuilder from "./builders/GalleryBuilder.vue"
import CtaBuilder from "./builders/CtaBuilder.vue"
import ContentSplitBuilder from "./builders/ContentLayoutBuilder.vue"
import StructuredContentBuilder from "./builders/StructuredContentBuilder.vue"
import LandingFeatureBuilder from "./builders/LandingFeatureBuilder.vue"
import ProjectLocationBuilder from "./builders/ProjectLocationBuilder.vue"

const props = defineProps<{
  mode?: "create" | "edit"
}>()

const router = useRouter()
const route = useRoute()
const { request } = useApi()
const notify = useNotify()
const config = useRuntimeConfig()

const sectionData = ref<Record<string, any>>({})
const useLayoutBuilder = ref(true)

const sectionId = computed(() => route.params.id as string | undefined)
const isEdit = computed(() => props.mode === "edit")

const loading = ref(false)
const errors = ref<Record<string, any>>({})

const sectionImage = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
const imageInputRef = ref<HTMLInputElement | null>(null)

const form = ref({
  page: null as number | null,
  section_type: "hero",
  title: "",
  subtitle: "",
  content: "",
  image_position: "top",
  data: `{
  "items": []
}`,
  sort_order: 0,
  is_active: true,
})

const sectionConfig: Record<string, { builder: boolean; fields: string[] }> = {
  hero: {
    builder: true,
    fields: ["title", "subtitle"],
  },

  landing_feature: {
    builder: true,
    fields: ["title", "subtitle"],
  },

  project_location: {
    builder: true,
    fields: ["title", "subtitle"],
  },

  content: {
    builder: false,
    fields: ["title", "subtitle", "content"],
  },

  split_content: {
    builder: true,
    fields: ["title", "subtitle"],
  },

  structured_content: {
    builder: true,
    fields: ["title", "subtitle", "content"],
  },

  cards: {
    builder: true,
    fields: ["title", "subtitle"],
  },

  values: {
    builder: true,
    fields: ["title", "subtitle"],
  },

  quote: {
    builder: true,
    fields: [],
  },

  gallery: {
    builder: true,
    fields: ["title"],
  },

  cta: {
    builder: true,
    fields: ["title", "subtitle"],
  },

  image: {
    builder: false,
    fields: ["title", "subtitle", "content"],
  },
}

const currentBuilder = computed(() => {
  switch (form.value.section_type) {
    case "hero":
      return HeroBuilder
    case "landing_feature":
      return LandingFeatureBuilder
    case "split_content":
      return ContentSplitBuilder
    case "project_location":
      return ProjectLocationBuilder
    case "structured_content":
      return StructuredContentBuilder
    case "cards":
      return CardsBuilder
    case "values":
      return ValuesBuilder
    case "quote":
      return QuoteBuilder
    case "gallery":
      return GalleryBuilder
    case "cta":
      return CtaBuilder
    default:
      return null
  }
})

const currentConfig = computed(() => {
  return (
    sectionConfig[form.value.section_type] ?? {
      builder: false,
      fields: ["title", "subtitle", "content"],
    }
  )
})

const hasBuilder = computed(() => {
  return currentConfig.value.builder && !!currentBuilder.value
})

const showRawFields = computed(() => {
  return true
})

const showTitle = computed(() => {
  return showRawFields.value && currentConfig.value.fields.includes("title")
})

const showSubtitle = computed(() => {
  return showRawFields.value && currentConfig.value.fields.includes("subtitle")
})

const showContent = computed(() => {
  // structured content selalu pakai editor
  if (form.value.section_type === "structured_content") {
    return true
  }

  // rich content biasa
  if (form.value.section_type === "content") {
    return true
  }

  return (
    currentConfig.value.fields.includes("content") &&
    !useLayoutBuilder.value
  )
})

function syncBuilderToMainFields() {
  if (!useLayoutBuilder.value) return

  // Hero
  if (form.value.section_type === "hero") {
    sectionData.value.eyebrow =
      sectionData.value.eyebrow ?? ""
  }

  // Split Content
  if (form.value.section_type === "split_content") {
    form.value.content = ""
  }

}

function onImageChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0] ?? null
  if (!file) return

  sectionImage.value = file
  imagePreview.value = URL.createObjectURL(file)
}

function removeImage() {
  sectionImage.value = null
  imagePreview.value = null

  if (imageInputRef.value) {
    imageInputRef.value.value = ""
  }
}

onMounted(async () => {
  if (!isEdit.value || !sectionId.value) return

  loading.value = true

  try {
    const data: any = await request(`/api/cms/sections/${sectionId.value}/`, {
      method: "GET",
    })

    form.value = {
      page: data.page ?? null,
      section_type: data.section_type ?? "hero",
      title: data.title ?? "",
      subtitle: data.subtitle ?? "",
      content: data.content ?? "",
      image_position: data.image_position ?? "top",
      data: JSON.stringify(data.data ?? {}, null, 2),
      sort_order: data.sort_order ?? 0,
      is_active: data.is_active ?? true,
    }

    sectionData.value = {
      ...(data.data ?? {}),
      title: data.data?.title ?? data.title ?? "",
      subtitle: data.data?.subtitle ?? data.subtitle ?? "",
      content: data.data?.content ?? data.content ?? "",
    }

    imagePreview.value = data.image_url ?? null
  } catch (e: any) {
    notify.error(e?.data?.detail || e?.message || "Failed to load section")
  } finally {
    loading.value = false
  }
})

async function submit() {
  loading.value = true
  errors.value = {}

  try {
    syncBuilderToMainFields()

    const fd = new FormData()

    if (form.value.page != null) {
      fd.append("page", String(form.value.page))
    }

    fd.append("section_type", form.value.section_type)
    fd.append("title", form.value.title)
    fd.append("subtitle", form.value.subtitle)
    fd.append("content", form.value.content)
    fd.append("image_position", form.value.image_position)
    fd.append("data", JSON.stringify(sectionData.value ?? {}))
    fd.append("sort_order", String(form.value.sort_order))
    fd.append("is_active", String(form.value.is_active))

    if (sectionImage.value) {
      fd.append("image", sectionImage.value)
    }

    if (isEdit.value && sectionId.value) {
      await request(`/api/cms/sections/${sectionId.value}/`, {
        method: "PATCH",
        body: fd,
      })

      notify.success("Section updated successfully")
    } else {
      await request("/api/cms/sections/", {
        method: "POST",
        body: fd,
      })

      notify.success("Section created successfully")
    }

    router.push("/static/sections")
  } catch (e: any) {
    errors.value = e?.data ?? {}
    notify.error(e?.data?.detail || e?.message || "Failed to save section")
  } finally {
    loading.value = false
  }
}

async function handleTinyMceImageUpload(blobInfo: any) {
  const token = useCookie("access").value

  const fd = new FormData()
  fd.append("file", blobInfo.blob(), blobInfo.filename())

  const apiBase = config.public.apiBaseUrl || "http://kawi.localhost:8000"

  const res = await fetch(`${apiBase}/api/cms/tinymce/upload-section-image/`, {
    method: "POST",
    headers: token
      ? {
        Authorization: `Bearer ${token}`,
      }
      : {},
    body: fd,
  })

  if (!res.ok) {
    throw new Error("Image upload failed")
  }

  const data = await res.json()
  return data.location
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-8xl flex-col gap-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">
          {{ isEdit ? "Edit Page Section" : "Create Page Section" }}
        </h1>
        <p class="text-sm text-muted-foreground">
          Manage hero, content, cards, gallery, CTA, and landing page sections.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <Button variant="outline" @click="router.push('/static/sections')">
          Cancel
        </Button>

        <Button :disabled="loading || !form.page || !form.section_type" @click="submit">
          {{ loading ? "Saving..." : isEdit ? "Update Section" : "Save Section" }}
        </Button>
      </div>
    </div>

    <div class="grid grid-cols-12 gap-6">
      <div class="col-span-12 lg:col-span-9">
        <div class="rounded-2xl border bg-background p-6 shadow-sm">
          <div class="grid gap-6">
            <div v-if="hasBuilder" class="flex items-center justify-between rounded-2xl border bg-muted/30 p-4">
              <div>
                <p class="font-semibold">Layout Builder</p>
                <p class="text-xs text-muted-foreground">
                  Use visual builder for this section. Disable to edit raw fields.
                </p>
              </div>

              <input v-model="useLayoutBuilder" type="checkbox" class="h-4 w-4" />
            </div>

            <div v-if="showRawFields" class="grid gap-6">
              <div v-if="showTitle" class="grid gap-2">
                <label class="text-sm font-medium">Title</label>
                <Input v-model="form.title" placeholder="Section title" />
              </div>

              <div v-if="showSubtitle" class="grid gap-2">
                <label class="text-sm font-medium">Subtitle</label>
                <Textarea v-model="form.subtitle" rows="3" placeholder="Section subtitle" />
              </div>

              <div v-if="showContent" class="grid gap-2">
                <label class="text-sm font-medium">Content</label>
                <Editor v-model="form.content" :tinymceScriptSrc="'/tinymce/tinymce.min.js'" :init="{
                  license_key: 'gpl',
                  height: 420,
                  menubar: true,
                  branding: false,
                  promotion: false,
                  plugins: [
                    'advlist',
                    'autolink',
                    'lists',
                    'link',
                    'image',
                    'charmap',
                    'preview',
                    'anchor',
                    'searchreplace',
                    'visualblocks',
                    'code',
                    'fullscreen',
                    'insertdatetime',
                    'media',
                    'table',
                    'help',
                    'wordcount'
                  ],
                  toolbar:
                    'undo redo | blocks | bold italic underline forecolor | ' +
                    'alignleft aligncenter alignright alignjustify | ' +
                    'bullist numlist outdent indent | link image media table | ' +
                    'removeformat preview code fullscreen',
                  automatic_uploads: true,
                  file_picker_types: 'image',
                  images_upload_handler: handleTinyMceImageUpload,
                  image_title: true,
                  image_advtab: true,
                  object_resizing: true
                }" />
              </div>
            </div>

            <div v-if="hasBuilder && useLayoutBuilder" class="grid gap-2">
              <component :is="currentBuilder" v-model="sectionData" />
            </div>

            <div v-if="!hasBuilder" class="grid gap-2">
              <label class="text-sm font-medium">JSON Data</label>
              <Textarea v-model="form.data" rows="10" class="font-mono text-sm" placeholder="{ }" />
              <p class="text-xs text-muted-foreground">
                Optional custom data for this section type.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="col-span-12 lg:col-span-3">
        <div class="flex flex-col gap-4">
          <div class="rounded-2xl border bg-background p-5 shadow-sm">
            <div class="grid gap-4">
              <h3 class="font-semibold">Section Settings</h3>

              <div class="grid gap-2">
                <label class="text-sm font-medium">Page</label>
                <SelectLookup v-model="form.page" label="Page" endpoint="/api/cms/pages/" label-key="title"
                  value-key="id" placeholder="Select page" />
              </div>

              <div class="grid gap-2">
                <label class="text-sm font-medium">Section Type</label>
                <select v-model="form.section_type" class="h-10 rounded-md border bg-background px-3 text-sm">
                  <option value="hero">Hero</option>
                  <option value="landing_feature">Landing Feature</option>
                  <option value="content">Content / Rich Text</option>
                  <option value="structured_content">Structured Content</option>
                  <option value="split_content">Split Content</option>
                  <option value="project_location">Project Location</option>
                  <option value="image">Image</option>
                  <option value="cards">Cards</option>
                  <option value="values">Values</option>
                  <option value="quote">Quote</option>
                  <option value="gallery">Gallery</option>
                  <option value="cta">CTA</option>
                </select>
              </div>

              <div class="grid gap-2">
                <label class="text-sm font-medium">Image Position</label>
                <select v-model="form.image_position" class="h-10 rounded-md border bg-background px-3 text-sm">
                  <option value="top">Top</option>
                  <option value="bottom">Bottom</option>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                  <option value="background">Background</option>
                </select>
              </div>

              <div class="grid gap-2">
                <label class="text-sm font-medium">Sort Order</label>
                <Input v-model="form.sort_order" type="number" />
              </div>

              <div class="flex items-center justify-between rounded-xl border p-3">
                <div>
                  <p class="text-sm font-medium">Active</p>
                  <p class="text-xs text-muted-foreground">
                    Show this section on public page.
                  </p>
                </div>

                <input v-model="form.is_active" type="checkbox" class="h-4 w-4" />
              </div>
            </div>
          </div>

          <Accordion type="single" collapsible class="rounded-2xl border bg-background px-5 shadow-sm">
            <AccordionItem value="section-image" class="border-0">
              <AccordionTrigger class="py-5 font-semibold hover:no-underline">
                Section Image
              </AccordionTrigger>

              <AccordionContent class="pb-5">
                <div class="grid gap-4">
                  <Button v-if="imagePreview" type="button" variant="ghost" size="sm"
                    class="justify-self-end text-destructive" @click="removeImage">
                    Remove
                  </Button>

                  <div v-if="imagePreview" class="overflow-hidden rounded-xl border bg-muted">
                    <img :src="imagePreview" class="aspect-video w-full object-cover" />
                  </div>

                  <div v-else
                    class="flex aspect-video items-center justify-center rounded-xl border border-dashed bg-muted/30 text-sm text-muted-foreground">
                    No section image selected
                  </div>

                  <input ref="imageInputRef" type="file" accept="image/*"
                    class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    @change="onImageChange" />
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  </div>
</template>