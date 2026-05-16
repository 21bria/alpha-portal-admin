<script setup lang="ts">
import { ref, watch, computed } from "vue"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type UserRole = "SYSTEM" | "GLOBAL_VIEWER" | "ADMIN_USER"

export type CompanyProfilePayload = {
  id?: number

  company_name: string
  legal_name?: string
  tagline?: string

  primary_logo?: File | null
  white_logo?: File | null
  favicon?: File | null

  address?: string
  phone?: string
  email?: string

  linkedin_url?: string
  instagram_url?: string
  youtube_url?: string
  x_url?: string

  copyright_text?: string
  meta_title?: string
  meta_description?: string

  privacy_policy_url?: string
  cookie_policy_url?: string
  terms_url?: string
}

type CompanyProfileFormState = {
  id?: number

  company_name: string
  legal_name: string
  tagline: string

  primary_logo: File | null
  white_logo: File | null
  favicon: File | null

  address: string
  phone: string
  email: string

  linkedin_url: string
  instagram_url: string
  youtube_url: string
  x_url: string

  copyright_text: string
  meta_title: string
  meta_description: string

  privacy_policy_url: string
  cookie_policy_url: string
  terms_url: string
}

const props = defineProps<{
  open: boolean
  mode: "create" | "edit"
  role: UserRole
  initial?: Record<string, any> | null
  loading?: boolean
  errors?: Record<string, any> | null
}>()

const emit = defineEmits<{
  (e: "update:open", v: boolean): void
  (e: "submit", payload: CompanyProfilePayload): void
}>()

const canMutate = computed(() => props.role !== "GLOBAL_VIEWER")

const title = computed(() =>
  props.mode === "create"
    ? "Add Company Profile"
    : "Edit Company Profile"
)

const local = ref<CompanyProfileFormState>({
  id: undefined,

  company_name: "",
  legal_name: "",
  tagline: "",

  primary_logo: null,
  white_logo: null,
  favicon: null,

  address: "",
  phone: "",
  email: "",

  linkedin_url: "",
  instagram_url: "",
  youtube_url: "",
  x_url: "",

  copyright_text: "",
  meta_title: "",
  meta_description: "",

  privacy_policy_url: "",
  cookie_policy_url: "",
  terms_url: "",
})

function fieldError(key: string) {
  const e = props.errors?.[key]
  return Array.isArray(e) ? e[0] : e ?? null
}

function close() {
  emit("update:open", false)
}

function setFile(key: "primary_logo" | "white_logo" | "favicon", e: Event) {
  const input = e.target as HTMLInputElement
  local.value[key] = input.files?.[0] || null
}

function submit() {
  const payload: CompanyProfilePayload = {
    id: local.value.id,

    company_name: local.value.company_name.trim(),
    legal_name: local.value.legal_name.trim(),
    tagline: local.value.tagline.trim(),

    primary_logo: local.value.primary_logo,
    white_logo: local.value.white_logo,
    favicon: local.value.favicon,

    address: local.value.address.trim(),
    phone: local.value.phone.trim(),
    email: local.value.email.trim(),

    linkedin_url: local.value.linkedin_url.trim(),
    instagram_url: local.value.instagram_url.trim(),
    youtube_url: local.value.youtube_url.trim(),
    x_url: local.value.x_url.trim(),

    copyright_text: local.value.copyright_text.trim(),
    meta_title: local.value.meta_title.trim(),
    meta_description: local.value.meta_description.trim(),

    privacy_policy_url: local.value.privacy_policy_url.trim(),
    cookie_policy_url: local.value.cookie_policy_url.trim(),
    terms_url: local.value.terms_url.trim(),
  }

  emit("submit", payload)
}

watch(
  () => props.open,
  (open) => {
    if (!open) return

    local.value = {
      id: props.initial?.id,

      company_name: props.initial?.company_name ?? "",
      legal_name: props.initial?.legal_name ?? "",
      tagline: props.initial?.tagline ?? "",

      primary_logo: null,
      white_logo: null,
      favicon: null,

      address: props.initial?.address ?? "",
      phone: props.initial?.phone ?? "",
      email: props.initial?.email ?? "",

      linkedin_url: props.initial?.linkedin_url ?? "",
      instagram_url: props.initial?.instagram_url ?? "",
      youtube_url: props.initial?.youtube_url ?? "",
      x_url: props.initial?.x_url ?? "",

      copyright_text: props.initial?.copyright_text ?? "",
      meta_title: props.initial?.meta_title ?? "",
      meta_description: props.initial?.meta_description ?? "",

      privacy_policy_url: props.initial?.privacy_policy_url ?? "",
      cookie_policy_url: props.initial?.cookie_policy_url ?? "",
      terms_url: props.initial?.terms_url ?? "",
    }
  },
  { immediate: true }
)
</script>

<template>
  <Dialog :open="open" @update:open="(v) => emit('update:open', v)">
    <DialogContent class="max-h-[90vh] sm:max-w-7xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
      </DialogHeader>
      <div class="grid gap-6 py-2">
        <div class="grid gap-6 lg:grid-cols-2">
          <!-- LEFT: Company Identity -->
          <div class="space-y-5 rounded-2xl border border-zinc-200 p-5">
            <h3 class="text-sm font-semibold">Company Identity</h3>
            <!-- company name, legal name, tagline, logos -->
                    <div class="grid gap-4 md:grid-cols-2">
                <div class="grid gap-2">
                  <label class="text-sm font-medium">Company Name</label>
                  <Input v-model="local.company_name" :disabled="!canMutate" />
                  <p v-if="fieldError('company_name')" class="text-sm text-destructive">
                    {{ fieldError("company_name") }}
                  </p>
                </div>

                <div class="grid gap-2">
                  <label class="text-sm font-medium">Legal Name</label>
                  <Input v-model="local.legal_name" :disabled="!canMutate" />
                </div>
              </div>

              <div class="grid gap-2">
                <label class="text-sm font-medium">Tagline</label>
                <Input v-model="local.tagline" :disabled="!canMutate" />
              </div>

              <div class="grid gap-4 md:grid-cols-3">
                <div class="grid gap-2">
                  <label class="text-sm font-medium">Primary Logo</label>
                  <Input type="file" accept="image/*" :disabled="!canMutate" @change="setFile('primary_logo', $event)" />
                </div>

                <div class="grid gap-2">
                  <label class="text-sm font-medium">White Logo</label>
                  <Input type="file" accept="image/*" :disabled="!canMutate" @change="setFile('white_logo', $event)" />
                </div>

                <div class="grid gap-2">
                  <label class="text-sm font-medium">Favicon</label>
                  <Input type="file" accept="image/*" :disabled="!canMutate" @change="setFile('favicon', $event)" />
                </div>
              </div>

          </div>

          <!-- RIGHT: Contact & Social -->
          <div class="space-y-5 rounded-2xl border border-zinc-200 p-5">
            <h3 class="text-sm font-semibold">Contact & Social</h3>
            <!-- address, phone, email, socials -->
              <div class="grid gap-2">
                <label class="text-sm font-medium">Address</label>
                <Textarea v-model="local.address" rows="4" :disabled="!canMutate" />
              </div>
              <div class="grid gap-2">
                  <label class="text-sm font-medium">Phone</label>
                  <Input v-model="local.phone" :disabled="!canMutate" />
                </div>

                <div class="grid gap-2">
                  <label class="text-sm font-medium">Email</label>
                  <Input v-model="local.email" type="email" :disabled="!canMutate" />
                </div>
                 <div class="grid gap-4 md:grid-cols-2">
                <Input v-model="local.linkedin_url" placeholder="LinkedIn URL" :disabled="!canMutate" />
                <Input v-model="local.instagram_url" placeholder="Instagram URL" :disabled="!canMutate" />
                <Input v-model="local.youtube_url" placeholder="YouTube URL" :disabled="!canMutate" />
                <Input v-model="local.x_url" placeholder="X URL" :disabled="!canMutate" />
        </div>
          </div>
        </div>

        <!-- BOTTOM: SEO & Legal -->
        <div class="space-y-5 rounded-2xl border border-zinc-200 p-5">
          <h3 class="text-sm font-semibold">SEO & Legal</h3>
          <!-- copyright, meta, policy urls -->
          <div class="grid gap-2">
            <label class="text-sm font-medium">Copyright Text</label>
            <Input v-model="local.copyright_text" :disabled="!canMutate" />
          </div>

          <div class="grid gap-2">
            <label class="text-sm font-medium">Meta Title</label>
            <Input v-model="local.meta_title" :disabled="!canMutate" />
          </div>

          <div class="grid gap-2">
            <label class="text-sm font-medium">Meta Description</label>
            <Textarea v-model="local.meta_description" rows="3" :disabled="!canMutate" />
          </div>

          <div class="grid gap-4 md:grid-cols-3">
            <Input v-model="local.privacy_policy_url" placeholder="Privacy Policy URL" :disabled="!canMutate" />
            <Input v-model="local.cookie_policy_url" placeholder="Cookie Policy URL" :disabled="!canMutate" />
            <Input v-model="local.terms_url" placeholder="Terms URL" :disabled="!canMutate" />
          </div>
        </div>
        <p v-if="fieldError('detail')" class="text-sm text-destructive">
          {{ fieldError("detail") }}
        </p>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="close">
          Cancel
        </Button>

        <Button
          v-if="canMutate"
          :disabled="loading || !local.company_name.trim()"
          @click="submit"
        >
          {{ loading ? "Saving..." : "Save Profile" }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>