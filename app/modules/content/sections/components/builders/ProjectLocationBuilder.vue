<script setup lang="ts">
const model = defineModel<Record<string, any>>({
    default: {
        eyebrow: "Project Location",
        map_image: "/images/indonesia-map.svg",
        theme: "dark",
        projects: [],
    },
})

function update(key: string, value: any) {
    model.value = {
        ...model.value,
        [key]: value,
    }
}

/**
 * Projects
 */
function addProject() {
    update("projects", [
        ...(model.value.projects ?? []),
        {
            slug: "",
            name: "",
            label: "",
            location: "",
            description: "",
            status: "Active Site",
            country: "Indonesia",
            x: 50,
            y: 50,
        },
    ])
}

function updateProject(index: number, key: string, value: any) {
    const projects = [...(model.value.projects ?? [])]

    projects[index] = {
        ...projects[index],
        [key]: value,
    }

    update("projects", projects)
}

function removeProject(index: number) {
    update(
        "projects",
        (model.value.projects ?? []).filter((_: any, i: number) => i !== index)
    )
}
</script>

<template>
    <div class="grid gap-6 rounded-2xl border p-5">
        <div>
            <h3 class="font-semibold">Project Location Builder</h3>

            <p class="text-xs text-muted-foreground">
                Use for Indonesia project map, mining operation sites, and strategic location showcase.
            </p>
        </div>

        <div class="grid gap-2">
            <label class="text-sm font-medium">Eyebrow</label>

            <Input :model-value="model.eyebrow ?? ''" placeholder="Project Location"
                @update:model-value="update('eyebrow', $event)" />
        </div>

        <div class="grid gap-2">
            <label class="text-sm font-medium">Map Image</label>

            <Input :model-value="model.map_image ?? ''" placeholder="/images/indonesia-map.svg"
                @update:model-value="update('map_image', $event)" />
        </div>

        <div class="grid gap-2">
            <label class="text-sm font-medium">Theme</label>

            <select :value="model.theme ?? 'dark'" class="h-10 rounded-md border bg-background px-3 text-sm"
                @change="update('theme', ($event.target as HTMLSelectElement).value)">
                <option value="dark">Dark</option>
                <option value="light">Light</option>
            </select>
        </div>

        <div class="rounded-2xl border bg-muted/30 p-4">
            <p class="mb-3 text-sm font-semibold">Layout Preview</p>

            <div class="overflow-hidden rounded-2xl bg-black p-4">
                <div class="grid gap-4">
                    <div class="text-center">
                        <div class="mx-auto h-3 w-32 rounded bg-amber-300/70"></div>

                        <div class="mx-auto mt-3 h-6 w-2/3 rounded bg-white/80"></div>

                        <div class="mx-auto mt-3 h-3 w-1/2 rounded bg-white/20"></div>
                    </div>

                    <div class="relative h-[260px] overflow-hidden rounded-2xl border border-white/10 bg-zinc-950">
                        <div
                            class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:40px_40px]" />

                        <div class="absolute left-[72%] top-[35%]">
                            <div class="h-5 w-5 rounded-full bg-amber-300 shadow-lg"></div>
                        </div>

                        <div
                            class="absolute bottom-5 left-1/2 h-16 w-44 -translate-x-1/2 rounded-xl border border-white/10 bg-white/5" />
                    </div>

                    <div class="grid gap-3 md:grid-cols-3">
                        <div class="h-20 rounded-xl border border-white/10 bg-black"></div>
                        <div class="h-20 rounded-xl border border-white/10 bg-black"></div>
                        <div class="h-20 rounded-xl border border-white/10 bg-black"></div>
                    </div>
                </div>
            </div>
        </div>

        <div class="grid gap-4">
            <div class="flex items-center justify-between">
                <h4 class="font-semibold">Project Locations</h4>

                <Button type="button" variant="outline" size="sm" @click="addProject">
                    Add Project
                </Button>
            </div>

            <div v-for="(project, index) in model.projects ?? []" :key="index"
                class="grid gap-4 rounded-2xl border p-4">
                <div class="flex items-center justify-between">
                    <p class="text-sm font-medium">
                        Project {{Number(index) + 1 }}
                    </p>

                    <Button type="button" variant="ghost" size="sm" @click="removeProject(Number(index))">
                        Remove
                    </Button>
                </div>

                <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <Input :model-value="project.slug ?? ''" placeholder="pulau-gebe"
                        @update:model-value="updateProject(Number(index), 'slug', $event)" />

                    <Input :model-value="project.name ?? ''" placeholder="Pulau Gebe"
                        @update:model-value="updateProject(Number(index), 'name', $event)" />
                </div>

                <Input :model-value="project.label ?? ''" placeholder="Pulau Gebe Project"
                    @update:model-value="updateProject(Number(index), 'label', $event)" />

                <Input :model-value="project.location ?? ''" placeholder="Maluku Utara, Indonesia"
                    @update:model-value="updateProject(Number(index), 'location', $event)" />

                <Textarea :model-value="project.description ?? ''" rows="3"
                    placeholder="North Maluku integrated nickel operation area."
                    @update:model-value="updateProject(Number(index), 'description', $event)" />

                <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <Input :model-value="project.status ?? ''" placeholder="Active Site"
                        @update:model-value="updateProject(Number(index), 'status', $event)" />

                    <Input :model-value="project.country ?? ''" placeholder="Indonesia"
                        @update:model-value="updateProject(Number(index), 'country', $event)" />
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div class="grid gap-2">
                        <label class="text-xs font-medium text-muted-foreground">
                            X Position (%)
                        </label>

                        <Input type="number" :model-value="project.x ?? 50" placeholder="72.8"
                            @update:model-value="updateProject(Number(index), 'x', Number($event))" />
                    </div>

                    <div class="grid gap-2">
                        <label class="text-xs font-medium text-muted-foreground">
                            Y Position (%)
                        </label>

                        <Input type="number" :model-value="project.y ?? 50" placeholder="35"
                            @update:model-value="updateProject(Number(index), 'y', Number($event))" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>