<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { useRoute, useRouter } from "vue-router"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import { useApi } from "@/composables/useApi"
import { useNotify } from "@/composables/useNotify"

const props = defineProps<{
  mode?: "create" | "edit"
}>()

const router = useRouter()
const route = useRoute()

const { request } = useApi()
const notify = useNotify()

const slug = computed(() => route.params.slug as string | undefined)
const isEdit = computed(() => props.mode === "edit")

const loading = ref(false)
const errors = ref<Record<string, any>>({})


const form = ref({
  title: "",
  department: "",
  location: "",
  employment_type: "Full-time",
  summary: "",
  responsibilities: [] as string[],
  requirements: [] as string[],
  is_open: true,
  published_at: "",
})

function fieldError(key: string) {
  const e = errors.value?.[key]
  return Array.isArray(e) ? e[0] : e ?? null
}

function addResponsibility() {
  form.value.responsibilities.push("")
}

function removeResponsibility(index: number) {
  form.value.responsibilities.splice(index, 1)
}

function addRequirement() {
  form.value.requirements.push("")
}

function removeRequirement(index: number) {
  form.value.requirements.splice(index, 1)
}
onMounted(async () => {
  if (!isEdit.value || !slug.value) return

  loading.value = true
  errors.value = {}

  try {
    const data: any = await request(`/api/cms/job-vacancies/${slug.value}/`, {
      method: "GET",
    })

    form.value = {
      title: data.title ?? "",
      department: data.department ?? "",
      location: data.location ?? "",
      employment_type: data.employment_type ?? "Full-time",
      summary: data.summary ?? "",
      responsibilities: data.responsibilities ?? [],
      requirements: data.requirements ?? [],
      is_open: data.is_open ?? true,
      published_at: data.published_at
        ? String(data.published_at).slice(0, 16)
        : "",
    }

  } catch (e: any) {
    notify.error(e?.data?.detail || e?.message || "Failed to load job vacancy")
  } finally {
    loading.value = false
  }
})

async function submit() {
  loading.value = true
  errors.value = {}

  try {
    const payload = {
      title: form.value.title,
      department: form.value.department,
      location: form.value.location,
      employment_type: form.value.employment_type,
      summary: form.value.summary,

      responsibilities: form.value.responsibilities
        .map((item) => item.trim())
        .filter(Boolean),

      requirements: form.value.requirements
        .map((item) => item.trim())
        .filter(Boolean),

      is_open: form.value.is_open,
      published_at: form.value.published_at || null,
    }

    if (isEdit.value && slug.value) {
      await request(`/api/cms/job-vacancies/${slug.value}/`, {
        method: "PATCH",
        body: payload,
      })

      notify.success("Job vacancy updated successfully")
    } else {
      await request("/api/cms/job-vacancies/", {
        method: "POST",
        body: payload,
      })

      notify.success("Job vacancy created successfully")
    }

    router.push("/careers")
  } catch (e: any) {
    errors.value = e?.data ?? {}
    notify.error(e?.data?.detail || e?.message || "Failed to save job vacancy")
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-7xl flex-col gap-6">
    <!-- HEADER -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight">
          {{ isEdit ? "Edit Job Vacancy" : "Create Job Vacancy" }}
        </h1>

        <p class="text-sm text-muted-foreground">
          Create and manage job openings for the company career portal.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <Button
          variant="outline"
          @click="router.push('/careers')" >
          Cancel
        </Button>

        <Button
          :disabled="loading || !form.title.trim()"
          @click="submit" >
          {{ loading ? "Saving..." : isEdit ? "Update Job" : "Publish Job" }}
        </Button>
      </div>
    </div>

    <!-- CONTENT -->
    <div class="grid grid-cols-12 gap-6">
      <!-- MAIN -->
      <div class="col-span-12 lg:col-span-8">
        <div class="rounded-2xl border bg-background p-6 shadow-sm">
          <div class="grid gap-6">
            <!-- TITLE -->
            <div class="grid gap-2">
              <label class="text-sm font-medium">
                Job Title
              </label>

              <Input
                v-model="form.title"
                placeholder="Example: Mine Planning Engineer"
              />

              <p
                v-if="fieldError('title')"
                class="text-sm text-destructive">
                {{ fieldError("title") }}
              </p>
            </div>

            <!-- SUMMARY -->
            <div class="grid gap-2">
              <label class="text-sm font-medium">
                Job Summary
              </label>

              <Textarea
                v-model="form.summary"
                rows="6"
                placeholder="Short description about this role"
              />

              <p
                v-if="fieldError('summary')"
                class="text-sm text-destructive">
                {{ fieldError("summary") }}
              </p>
            </div>

            <!-- RESPONSIBILITIES -->
            <div class="grid gap-3">
              <div class="flex items-center justify-between">
                <label class="text-sm font-medium">Responsibilities</label>

                <Button type="button" variant="outline" size="sm" @click="addResponsibility">
                  + Add
                </Button>
              </div>

              <div
                v-for="(_, index) in form.responsibilities"
                :key="index"
                class="flex gap-2" >
                <Input
                  v-model="form.responsibilities[index]"
                  placeholder="Example: Prepare inspection reports..."
                />

                <Button type="button" variant="outline" @click="removeResponsibility(index)">
                  Remove
                </Button>
              </div>

              <p v-if="fieldError('responsibilities')" class="text-sm text-destructive">
                {{ fieldError("responsibilities") }}
              </p>
            </div>

            <!-- REQUIREMENTS -->
            <div class="grid gap-3">
              <div class="flex items-center justify-between">
                <label class="text-sm font-medium">Requirements</label>

                <Button type="button" variant="outline" size="sm" @click="addRequirement">
                  + Add
                </Button>
              </div>

              <div
                v-for="(_, index) in form.requirements"
                :key="index"
                class="flex gap-2">
                <Input
                  v-model="form.requirements[index]"
                  placeholder="Example: Minimum 4 years of experience..."
                />

                <Button type="button" variant="outline" @click="removeRequirement(index)">
                  Remove
                </Button>
              </div>

              <p v-if="fieldError('requirements')" class="text-sm text-destructive">
                {{ fieldError("requirements") }}
              </p>
            </div>

          </div>
        </div>
      </div>

      <!-- SIDEBAR -->
      <div class="col-span-12 lg:col-span-4">
        <div class="flex flex-col gap-4">
          <!-- SETTINGS -->
          <div class="rounded-2xl border bg-background p-5 shadow-sm">
            <div class="grid gap-4">
              <h3 class="font-semibold">
                Job Settings
              </h3>

              <div class="grid gap-2">
                <label class="text-sm font-medium">
                  Department
                </label>

                <Input
                  v-model="form.department"
                  placeholder="Example: Operations"
                />

                <p
                  v-if="fieldError('department')"
                  class="text-sm text-destructive" >
                  {{ fieldError("department") }}
                </p>
              </div>

              <div class="grid gap-2">
                <label class="text-sm font-medium">
                  Location
                </label>

                <Input
                  v-model="form.location"
                  placeholder="Example: Jakarta / Site Gebe"
                />

                <p
                  v-if="fieldError('location')"
                  class="text-sm text-destructive">
                  {{ fieldError("location") }}
                </p>
              </div>

              <div class="grid gap-2">
                <label class="text-sm font-medium">
                  Employment Type
                </label>

                <select
                  v-model="form.employment_type"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option>Full-time</option>
                  <option>Contract</option>
                  <option>Internship</option>
                  <option>Part-time</option>
                  <option>Temporary</option>
                </select>

                <p
                  v-if="fieldError('employment_type')"
                  class="text-sm text-destructive" >
                  {{ fieldError("employment_type") }}
                </p>
              </div>

              <div class="grid gap-2">
                <label class="text-sm font-medium">
                  Published At
                </label>

                <Input
                  v-model="form.published_at"
                  type="datetime-local"
                />

                <p
                  v-if="fieldError('published_at')"
                  class="text-sm text-destructive"
                >
                  {{ fieldError("published_at") }}
                </p>
              </div>

              <div class="flex items-center justify-between rounded-xl border p-3">
                <div>
                  <p class="text-sm font-medium">
                    Open Vacancy
                  </p>

                  <p class="text-xs text-muted-foreground">
                    Show this job on the career portal
                  </p>
                </div>

                <input
                  v-model="form.is_open"
                  type="checkbox"
                  class="h-4 w-4"
                />
              </div>
            </div>
          </div>

          <!-- PREVIEW -->
          <div class="rounded-2xl border bg-background p-5 shadow-sm">
            <h3 class="font-semibold">
              Preview
            </h3>

            <div class="mt-4 rounded-xl border bg-muted/30 p-4">
              <p class="text-sm font-semibold">
                {{ form.title || "Job title" }}
              </p>

              <p class="mt-2 text-xs text-muted-foreground">
                {{ form.department || "Department" }}
                •
                {{ form.location || "Location" }}
              </p>

              <span
                class="mt-4 inline-flex rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600">
                {{ form.is_open ? "Open" : "Closed" }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>