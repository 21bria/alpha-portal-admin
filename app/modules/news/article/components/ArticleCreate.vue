<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Editor from "@tinymce/tinymce-vue"
import SelectLookup from "@/components/AsyncLookupSelect.vue"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import { useApi } from "@/composables/useApi"
import { useNotify } from "@/composables/useNotify"

const props = defineProps<{
  mode?: "create" | "edit"
}>()

const router = useRouter()
const route = useRoute()

const { request } = useApi()
const notify = useNotify()
const config = useRuntimeConfig()

const slug = computed(() => route.params.slug as string | undefined)
const isEdit = computed(() => props.mode === "edit")

const loading = ref(false)
const errors = ref<Record<string, any>>({})

const coverImage = ref<File | null>(null)
const coverPreview = ref<string | null>(null)
const coverInputRef = ref<HTMLInputElement | null>(null)

const form = ref({
  category: null as number | null,
  tags: [] as number[],
  title: "",
  excerpt: "",
  content: "",
  author_name: "",
  status: "published" as "draft" | "published" | "archived",
  seo_title: "",
  seo_description: "",
})

function fieldError(key: string) {
  const e = errors.value?.[key]
  return Array.isArray(e) ? e[0] : e ?? null
}

function onCoverChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0] ?? null

  if (!file) return

  coverImage.value = file
  coverPreview.value = URL.createObjectURL(file)
}

function removeCoverImage() {
  coverImage.value = null
  coverPreview.value = null

  if (coverInputRef.value) {
    coverInputRef.value.value = ""
  }
}

onMounted(async () => {
  if (!isEdit.value || !slug.value) return

  loading.value = true
  errors.value = {}

  try {
    const data: any = await request(`/api/cms/news/${slug.value}/`, {
      method: "GET",
    })

    form.value = {
      category: data.category ?? null,
      tags: data.tags ?? [],
      title: data.title ?? "",
      excerpt: data.excerpt ?? "",
      content: data.content ?? "",
      author_name: data.author_name ?? "",
      status: data.status ?? "draft",
      seo_title: data.seo_title ?? "",
      seo_description: data.seo_description ?? "",
    }

    coverPreview.value =
      data.cover_thumbnail_url ||
      data.cover_image_url ||
      null
  } catch (e: any) {
    notify.error(e?.data?.detail || e?.message || "Failed to load article")
  } finally {
    loading.value = false
  }
})

async function submit() {
  loading.value = true
  errors.value = {}

  try {
    const fd = new FormData()

    if (form.value.category != null) {
      fd.append("category", String(form.value.category))
    }

    form.value.tags.forEach((tag) => {
      fd.append("tags", String(tag))
    })

    fd.append("title", form.value.title)
    fd.append("excerpt", form.value.excerpt)
    fd.append("content", form.value.content)
    fd.append("author_name", form.value.author_name)
    fd.append("status", form.value.status)
    fd.append("seo_title", form.value.seo_title)
    fd.append("seo_description", form.value.seo_description)

    if (coverImage.value) {
      fd.append("cover_image", coverImage.value)
    }

    if (isEdit.value && slug.value) {
      await request(`/api/cms/news/${slug.value}/`, {
        method: "PATCH",
        body: fd,
      })

      notify.success("Article updated successfully")
    } else {
      await request("/api/cms/news/", {
        method: "POST",
        body: fd,
      })

      notify.success("Article created successfully")
    }

    router.push("/cms/news/article")
  } catch (e: any) {
    errors.value = e?.data ?? {}
    notify.error(e?.data?.detail || e?.message || "Failed to save article")
  } finally {
    loading.value = false
  }
}

async function handleTinyMceImageUpload(blobInfo: any) {
  const token = useCookie("access").value

  const fd = new FormData()
  fd.append("file", blobInfo.blob(), blobInfo.filename())

  const apiBase = config.public.apiBaseUrl || "http://kawi.localhost:8000"

  const res = await fetch(`${apiBase}/api/cms/tinymce/upload-image/`, {
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
    <!-- HEADER -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">
         {{ isEdit ? "Edit News Article" : "Create News Article" }}
        </h1>

        <p class="text-sm text-muted-foreground">
          Create and publish company news articles for the portal.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <Button variant="outline" @click="router.push('/cms/news/article')">
          Cancel
        </Button>

        <Button :disabled="loading || !form.title.trim()" @click="submit">
         {{ loading ? "Saving..." : isEdit ? "Update Article" : "Publish Article" }}
        </Button>
      </div>
    </div>

    <!-- CONTENT -->
    <div class="grid grid-cols-12 gap-6">
      <!-- MAIN -->
      <div class="col-span-12 lg:col-span-9">
        <div class="rounded-2xl border bg-background p-6 shadow-sm">
          <div class="grid gap-6">
            <!-- TITLE -->
            <div class="grid gap-2">
              <label class="text-sm font-medium">
                Article Title
              </label>

              <Input v-model="form.title" placeholder="Enter article title" />

              <p v-if="fieldError('title')" class="text-sm text-destructive">
                {{ fieldError("title") }}
              </p>
            </div>

            <!-- EXCERPT -->
            <div class="grid gap-2">
              <label class="text-sm font-medium">
                Excerpt
              </label>
              <Textarea v-model="form.excerpt" rows="4" placeholder="Short article summary" />
              <p v-if="fieldError('excerpt')" class="text-sm text-destructive">
                {{ fieldError("excerpt") }}
              </p>
            </div>

            <!-- CONTENT EDITOR -->
            <div class="grid gap-2">
              <label class="text-sm font-medium">
                Article Content
              </label>

              <Editor v-model="form.content" :tinymceScriptSrc="'/tinymce/tinymce.min.js'" :init="{
                license_key: 'gpl',
                height: 620,
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


              <p class="text-xs text-muted-foreground">
                Use this editor for article body content. You can insert multiple images,
                align them left, center, or right, add tables, links, lists, and headings.
              </p>

              <p v-if="fieldError('content')" class="text-sm text-destructive">
                {{ fieldError("content") }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- SIDEBAR -->
      <div class="col-span-12 lg:col-span-3">
        <div class="flex flex-col gap-4">
          <!-- SETTINGS -->
          <div class="rounded-2xl border bg-background p-5 shadow-sm">
            <div class="grid gap-3">
              <h3 class="font-semibold">
                Article Settings
              </h3>

              <div class="grid gap-2">
                <label class="text-sm font-medium">
                  Category
                </label>

                <SelectLookup 
                  v-model="form.category" 
                  label="Category"
                  endpoint="/api/cms/news-categories/" 
                  label-key="name"
                  value-key="id" 
                  placeholder="Select category" 
                />

                <p v-if="fieldError('category')" class="text-sm text-destructive">
                  {{ fieldError("category") }}
                </p>
              </div>
              
              <div class="grid gap-2">
                <label class="text-sm font-medium">
                  Tags
                </label>

                <SelectLookup
                  v-model="form.tags"
                  label="Tags"
                  endpoint="/api/cms/news-tags/"
                  label-key="name"
                  value-key="id"
                  placeholder="Select tags"
                  multiple
                />

                <p class="text-xs text-muted-foreground">
                  Used for related articles, filtering, and SEO.
                </p>

                <p
                  v-if="fieldError('tags')"
                  class="text-sm text-destructive"
                >
                  {{ fieldError("tags") }}
                </p>
              </div>

              <div class="grid gap-2">
                <label class="text-sm font-medium">
                  Author Name
                </label>

                <Input v-model="form.author_name" placeholder="Author name" />

                <p v-if="fieldError('author_name')" class="text-sm text-destructive">
                  {{ fieldError("author_name") }}
                </p>
              </div>

              <div class="flex items-center justify-between rounded-xl border p-3">
                <div>
                  <p class="text-sm font-medium">
                    Publish Status
                  </p>

                  <p class="text-xs text-muted-foreground">
                    Make article visible on portal
                  </p>
                </div>

                <input
                  :checked="form.status === 'published'"
                  type="checkbox"
                  class="h-4 w-4"
                  @change="(e: Event) => {
                    form.status = (e.target as HTMLInputElement).checked ? 'published' : 'draft'
                  }"
                />
              </div>
            </div>
          </div>

          <!-- SEO -->
          <div class="rounded-2xl border bg-background p-5 shadow-sm">
            <div class="grid gap-4">
              <h3 class="font-semibold">
                SEO Metadata
              </h3>

              <div class="grid gap-2">
                <label class="text-sm font-medium">
                  SEO Title
                </label>

                <Input v-model="form.seo_title" placeholder="SEO title" />
              </div>

              <div class="grid gap-2">
                <label class="text-sm font-medium">
                  SEO Description
                </label>

                <Textarea v-model="form.seo_description" rows="4" placeholder="SEO description" />
              </div>
            </div>
          </div>

          <!-- COVER IMAGE -->
          <Accordion type="single" collapsible default-value="cover-image"
            class="rounded-2xl border bg-background px-5 shadow-sm">
            <AccordionItem value="cover-image" class="border-0">
              <AccordionTrigger class="py-5 font-semibold hover:no-underline">
                Cover Image
              </AccordionTrigger>

              <AccordionContent class="pb-5">
                <div class="grid gap-4">
                  <div class="flex items-center justify-between">
                    <h3 class="font-semibold">
                      Cover Image
                    </h3>

                    <Button v-if="coverPreview" type="button" variant="ghost" size="sm" class="text-destructive"
                      @click="removeCoverImage">
                      Remove
                    </Button>
                  </div>

                  <div v-if="coverPreview" class="relative overflow-hidden rounded-xl border bg-muted">
                    <img :src="coverPreview" class="aspect-video w-full object-cover" alt="Cover preview" />
                  </div>

                  <div v-else
                    class="flex aspect-video items-center justify-center rounded-xl border border-dashed bg-muted/30 text-sm text-muted-foreground">
                    No cover image selected
                  </div>

                  <input ref="coverInputRef" type="file" accept="image/*"
                    class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    @change="onCoverChange" />

                  <p class="text-xs text-muted-foreground">
                    Used as article thumbnail, card image, and article header.
                  </p>

                  <p v-if="fieldError('cover_image')" class="text-sm text-destructive">
                    {{ fieldError("cover_image") }}
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>


        </div>
      </div>
    </div>

  </div>
</template>