<script setup lang="ts">
import SidebarNav from "@/modules/projects/SidebarNav.vue"
</script>

<template>
  <div class="pb-16 space-y-6">
    <div class="space-y-0.5">
      <h2 class="text-2xl font-bold tracking-tight">
        CMS: Projects & Sections
      </h2>

      <p class="text-muted-foreground">
        Manage mining projects, operational sites, exploration areas, project content sections,
        galleries, location information, structured layouts, and dynamic project page content.
      </p>
    </div>

    <Separator class="my-6" />

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div class="lg:col-span-2">
        <ClientOnly>
          <SidebarNav />
          <template #fallback>
            <div class="space-y-2">
              <div class="h-9 rounded-md bg-muted/60" />
              <div class="h-9 rounded-md bg-muted/60" />
            </div>
          </template>
        </ClientOnly>
      </div>

      <div class="lg:col-span-10">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
