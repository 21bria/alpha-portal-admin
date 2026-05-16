<script setup lang="ts">
const model = defineModel<Record<string, any>>({
    default: {
        eyebrow: 'About Us',
        primary_button_text: 'Learn More',
        primary_button_url: '/company/about',
        data: {
            layout: 'split-right',
            theme: 'dark',
        },
    },
})

function update(key: string, value: any) {
    model.value = {
        ...model.value,
        [key]: value,
    }
}

function updateData(key: string, value: any) {
    model.value = {
        ...model.value,
        data: {
            ...(model.value.data ?? {}),
            [key]: value,
        },
    }
}
</script>

<template>
    <div class="grid gap-4 rounded-2xl border p-5">
        <div>
            <h3 class="font-semibold">Split Content Builder</h3>
            <p class="text-xs text-muted-foreground">
                Use for about, company overview, ESG intro, career intro, or two-column content.
            </p>
        </div>

        <div class="grid gap-2">
            <label class="text-sm font-medium">Eyebrow</label>

            <Input
                :model-value="model.eyebrow ?? ''"
                placeholder="About Us"
                @update:model-value="update('eyebrow', $event)"
            />
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div class="grid gap-2">
                <label class="text-sm font-medium">Button Text</label>

                <Input
                    :model-value="model.primary_button_text ?? ''"
                    placeholder="Learn More"
                    @update:model-value="update('primary_button_text', $event)"
                />
            </div>

            <div class="grid gap-2">
                <label class="text-sm font-medium">Button URL</label>

                <Input
                    :model-value="model.primary_button_url ?? ''"
                    placeholder="/company/about"
                    @update:model-value="update('primary_button_url', $event)"
                />
            </div>
        </div>

        <div class="grid gap-2">
            <label class="text-sm font-medium">Layout</label>

            <select
                :value="model.data?.layout ?? 'split-right'"
                class="h-10 rounded-md border bg-background px-3 text-sm"
                @change="updateData('layout', ($event.target as HTMLSelectElement).value)"
            >
                <option value="split-right">Text left, content right</option>
                <option value="split-left">Content left, text right</option>
                <option value="centered">Centered</option>
                <option value="full-width">Full Width</option>
            </select>
        </div>

        <div class="grid gap-2">
            <label class="text-sm font-medium">Theme</label>

            <select
                :value="model.data?.theme ?? 'dark'"
                class="h-10 rounded-md border bg-background px-3 text-sm"
                @change="updateData('theme', ($event.target as HTMLSelectElement).value)"
            >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="muted">Muted</option>
            </select>
        </div>
    </div>
</template>