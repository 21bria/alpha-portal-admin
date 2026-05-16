<script setup lang="ts">
const model = defineModel<Record<string, any>>({
    default: {
        eyebrow: "Sustainability & ESG",
        primary_button_text: "ESG Report",
        primary_button_url: "/sustainability/esg",
        secondary_button_text: "Sustainability Strategy",
        secondary_button_url: "/sustainability",
        theme: "dark",
        layout: "hero_stats_cards",
        stats: [],
        cards: [],
    },
})

function update(key: string, value: any) {
    model.value = {
        ...model.value,
        [key]: value,
    }
}

/**
 * Stats
 */
function addStat() {
    update("stats", [
        ...(model.value.stats ?? []),
        {
            label: "",
            value: "",
            description: "",
        },
    ])
}

function updateStat(index: number, key: string, value: any) {
    const stats = [...(model.value.stats ?? [])]

    stats[index] = {
        ...stats[index],
        [key]: value,
    }

    update("stats", stats)
}

function removeStat(index: number) {
    update(
        "stats",
        (model.value.stats ?? []).filter((_: any, i: number) => i !== index)
    )
}

/**
 * Feature Cards
 */
function addCard() {
    update("cards", [
        ...(model.value.cards ?? []),
        {
            icon: "",
            title: "",
            description: "",
        },
    ])
}

function updateCard(index: number, key: string, value: any) {
    const cards = [...(model.value.cards ?? [])]

    cards[index] = {
        ...cards[index],
        [key]: value,
    }

    update("cards", cards)
}

function removeCard(index: number) {
    update(
        "cards",
        (model.value.cards ?? []).filter((_: any, i: number) => i !== index)
    )
}
</script>

<template>
    <div class="grid gap-6 rounded-2xl border p-5">
        <div>
            <h3 class="font-semibold">Landing Feature Builder</h3>
            <p class="text-xs text-muted-foreground">
                Use for landing page hero feature section with stats, CTA buttons, and feature cards.
            </p>
        </div>

        <div class="grid gap-2">
            <label class="text-sm font-medium">Eyebrow</label>

            <Input :model-value="model.eyebrow ?? ''" placeholder="Sustainability & ESG"
                @update:model-value="update('eyebrow', $event)" />
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div class="grid gap-2">
                <label class="text-sm font-medium">Primary Button Text</label>

                <Input :model-value="model.primary_button_text ?? ''" placeholder="ESG Report"
                    @update:model-value="update('primary_button_text', $event)" />
            </div>

            <div class="grid gap-2">
                <label class="text-sm font-medium">Primary Button URL</label>

                <Input :model-value="model.primary_button_url ?? ''" placeholder="/sustainability/esg"
                    @update:model-value="update('primary_button_url', $event)" />
            </div>

            <div class="grid gap-2">
                <label class="text-sm font-medium">Secondary Button Text</label>

                <Input :model-value="model.secondary_button_text ?? ''" placeholder="Sustainability Strategy"
                    @update:model-value="update('secondary_button_text', $event)" />
            </div>

            <div class="grid gap-2">
                <label class="text-sm font-medium">Secondary Button URL</label>

                <Input :model-value="model.secondary_button_url ?? ''" placeholder="/sustainability"
                    @update:model-value="update('secondary_button_url', $event)" />
            </div>
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div class="grid gap-2">
                <label class="text-sm font-medium">Theme</label>

                <select :value="model.theme ?? 'dark'" class="h-10 rounded-md border bg-background px-3 text-sm"
                    @change="update('theme', ($event.target as HTMLSelectElement).value)">
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                </select>
            </div>

            <div class="grid gap-2">
                <label class="text-sm font-medium">Layout</label>

                <select :value="model.layout ?? 'hero_stats_cards'"
                    class="h-10 rounded-md border bg-background px-3 text-sm"
                    @change="update('layout', ($event.target as HTMLSelectElement).value)">
                    <option value="hero_stats_cards">Hero + Stats + Cards</option>
                </select>
            </div>
        </div>

        <div class="rounded-2xl border bg-muted/30 p-4">
            <p class="mb-3 text-sm font-semibold">Layout Preview</p>

            <div class="grid gap-4 rounded-xl bg-black p-4">
                <div class="grid gap-3 md:grid-cols-2">
                    <div class="grid gap-2">
                        <div class="h-3 w-28 rounded bg-emerald-400/70"></div>
                        <div class="h-6 w-3/4 rounded bg-white/80"></div>
                        <div class="h-6 w-2/3 rounded bg-yellow-300/80"></div>
                        <div class="mt-2 h-3 w-full rounded bg-white/30"></div>
                        <div class="h-3 w-5/6 rounded bg-white/30"></div>

                        <div class="mt-3 flex gap-2">
                            <div class="h-8 w-24 rounded-full bg-emerald-500/50"></div>
                            <div class="h-8 w-32 rounded-full bg-white/10"></div>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
                        <div class="h-16 rounded-lg border border-white/10 bg-white/5"></div>
                        <div class="h-16 rounded-lg border border-white/10 bg-white/5"></div>
                        <div class="h-16 rounded-lg border border-white/10 bg-white/5"></div>
                        <div class="h-16 rounded-lg border border-white/10 bg-white/5"></div>
                    </div>
                </div>

                <div class="grid gap-2 md:grid-cols-3">
                    <div class="h-20 rounded-xl border border-white/10 bg-white/5"></div>
                    <div class="h-20 rounded-xl border border-white/10 bg-white/5"></div>
                    <div class="h-20 rounded-xl border border-white/10 bg-white/5"></div>
                </div>
            </div>
        </div>

        <div class="grid gap-4">
            <div class="flex items-center justify-between">
                <h4 class="font-semibold">Stats</h4>

                <Button type="button" variant="outline" size="sm" @click="addStat">
                    Add Stat
                </Button>
            </div>

            <div v-for="(stat, index) in model.stats ?? []" :key="index" class="grid gap-3 rounded-xl border p-4">
                <div class="flex items-center justify-between">
                    <p class="text-sm font-medium">Stat {{ index + 1 }}</p>

                    <Button type="button" variant="ghost" size="sm" @click="removeStat(index)">
                        Remove
                    </Button>
                </div>

                <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <Input :model-value="stat.label ?? ''" placeholder="Operational Sites"
                        @update:model-value="updateStat(index, 'label', $event)" />

                    <Input :model-value="stat.value ?? ''" placeholder="03"
                        @update:model-value="updateStat(index, 'value', $event)" />
                </div>

                <Textarea :model-value="stat.description ?? ''" rows="3"
                    placeholder="Integrated mining and logistics operation areas."
                    @update:model-value="updateStat(index, 'description', $event)" />
            </div>
        </div>

        <div class="grid gap-4">
            <div class="flex items-center justify-between">
                <h4 class="font-semibold">Feature Cards</h4>

                <Button type="button" variant="outline" size="sm" @click="addCard">
                    Add Card
                </Button>
            </div>

            <div v-for="(card, index) in model.cards ?? []" :key="index" class="grid gap-3 rounded-xl border p-4">
                <div class="flex items-center justify-between">
                    <p class="text-sm font-medium">Card {{ index + 1 }}</p>

                    <Button type="button" variant="ghost" size="sm" @click="removeCard(index)">
                        Remove
                    </Button>
                </div>

                <Input :model-value="card.icon ?? ''" placeholder="🌱"
                    @update:model-value="updateCard(index, 'icon', $event)" />

                <Input :model-value="card.title ?? ''" placeholder="Environmental Responsibility"
                    @update:model-value="updateCard(index, 'title', $event)" />

                <Textarea :model-value="card.description ?? ''" rows="3"
                    placeholder="Continuous monitoring and responsible resource management..."
                    @update:model-value="updateCard(index, 'description', $event)" />
            </div>
        </div>
    </div>
</template>