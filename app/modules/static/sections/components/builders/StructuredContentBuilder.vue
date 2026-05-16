<script setup lang="ts">
const model = defineModel<Record<string, any>>({
    default: {
        layout: "cards_bullets_quote",
        cards: [],
        bullets: [],
        approaches: [],
        quote: "",
    },
})

function update(key: string, value: any) {
    model.value = {
        ...model.value,
        [key]: value,
    }
}

/**
 * Cards
 */
function addCard() {
    update("cards", [
        ...(model.value.cards ?? []),
        {
            eyebrow: "",
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

/**
 * Bullets
 */
function addBullet() {
    update("bullets", [
        ...(model.value.bullets ?? []),
        {
            title: "",
            description: "",
        },
    ])
}

function updateBullet(index: number, key: string, value: any) {
    const bullets = [...(model.value.bullets ?? [])]

    bullets[index] = {
        ...bullets[index],
        [key]: value,
    }

    update("bullets", bullets)
}

function removeBullet(index: number) {
    update(
        "bullets",
        (model.value.bullets ?? []).filter((_: any, i: number) => i !== index)
    )
}

/**
 * Approaches
 */
function addApproach() {
    update("approaches", [
        ...(model.value.approaches ?? []),
        {
            title: "",
            description: "",
        },
    ])
}

function updateApproach(index: number, key: string, value: any) {
    const approaches = [...(model.value.approaches ?? [])]

    approaches[index] = {
        ...approaches[index],
        [key]: value,
    }

    update("approaches", approaches)
}

function removeApproach(index: number) {
    update(
        "approaches",
        (model.value.approaches ?? []).filter((_: any, i: number) => i !== index)
    )
}
</script>

<template>
    <div class="grid gap-6 rounded-2xl border p-5">
        <div>
            <h3 class="font-semibold">Structured Content Builder</h3>
            <p class="text-xs text-muted-foreground">
                Use for ESG, environment, community, governance, operations, or content pages.
            </p>
        </div>

        <div class="grid gap-2">
            <label class="text-sm font-medium">Layout Style</label>

            <select :value="model.layout ?? 'cards_bullets_quote'"
                class="h-10 rounded-md border bg-background px-3 text-sm"
                @change="update('layout', ($event.target as HTMLSelectElement).value)">
                <option value="cards_bullets_quote">
                    Cards + Bullets + Quote
                </option>

                <option value="cards_approach">
                    Cards + Approach List
                </option>
            </select>
        </div>

        <div class="rounded-2xl border bg-muted/30 p-4">
            <p class="mb-3 text-sm font-semibold">Layout Preview</p>

            <div v-if="model.layout === 'cards_bullets_quote'" class="grid gap-3">
                <div class="h-35 rounded-xl bg-muted"></div>

                <div class="grid grid-cols-2 gap-2">
                    <div class="h-16 rounded-xl border bg-background"></div>
                    <div class="h-16 rounded-xl border bg-background"></div>
                    <div class="h-16 rounded-xl border bg-background"></div>
                    <div class="h-16 rounded-xl border bg-background"></div>
                </div>

                <div class="h-12 rounded-xl bg-teal-50"></div>
            </div>

            <div v-else class="grid gap-3">
                <div class="h-35 rounded-xl bg-muted"></div>

                <div class="grid grid-cols-3 gap-2">
                    <div class="h-16 rounded-xl border bg-background"></div>
                    <div class="h-16 rounded-xl border bg-background"></div>
                    <div class="h-16 rounded-xl border bg-background"></div>
                </div>

                <div class="grid gap-2">
                    <div class="h-8 rounded-lg border-l-2 bg-background"></div>
                    <div class="h-8 rounded-lg border-l-2 bg-background"></div>
                    <div class="h-8 rounded-lg border-l-2 bg-background"></div>
                </div>
            </div>
        </div>

        <div class="grid gap-4">
            <div class="flex items-center justify-between">
                <h4 class="font-semibold">Cards</h4>

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

                <Input :model-value="card.eyebrow ?? ''" placeholder="Environment / Engagement / Monitoring"
                    @update:model-value="updateCard(index, 'eyebrow', $event)" />

                <Input :model-value="card.title ?? ''" placeholder="Responsible Resource Management"
                    @update:model-value="updateCard(index, 'title', $event)" />

                <Textarea :model-value="card.description ?? ''" rows="3"
                    placeholder="Managing mining activities with attention..."
                    @update:model-value="updateCard(index, 'description', $event)" />
            </div>
        </div>

        <div v-if="model.layout === 'cards_bullets_quote'" class="grid gap-4">
            <div class="flex items-center justify-between">
                <h4 class="font-semibold">Bullet Items</h4>

                <Button type="button" variant="outline" size="sm" @click="addBullet">
                    Add Bullet
                </Button>
            </div>

            <div v-for="(item, index) in model.bullets ?? []" :key="index" class="grid gap-3 rounded-xl border p-4">
                <div class="flex items-center justify-between">
                    <p class="text-sm font-medium">Bullet {{ index + 1 }}</p>

                    <Button type="button" variant="ghost" size="sm" @click="removeBullet(index)">
                        Remove
                    </Button>
                </div>

                <Input :model-value="item.title ?? ''" placeholder="Community Engagement"
                    @update:model-value="updateBullet(index, 'title', $event)" />

                <Textarea :model-value="item.description ?? ''" rows="3" placeholder="Maintaining open communication..."
                    @update:model-value="updateBullet(index, 'description', $event)" />
            </div>

            <div class="grid gap-2">
                <label class="text-sm font-medium">Quote</label>

                <Textarea :model-value="model.quote ?? ''" rows="3"
                    placeholder="Sustainable mining operations are built through long-term trust..."
                    @update:model-value="update('quote', $event)" />
            </div>
        </div>

        <div v-if="model.layout === 'cards_approach'" class="grid gap-4">
            <div class="flex items-center justify-between">
                <h4 class="font-semibold">Approach List</h4>

                <Button type="button" variant="outline" size="sm" @click="addApproach">
                    Add Approach
                </Button>
            </div>

            <div v-for="(item, index) in model.approaches ?? []" :key="index" class="grid gap-3 rounded-xl border p-4">
                <div class="flex items-center justify-between">
                    <p class="text-sm font-medium">Approach {{ index + 1 }}</p>

                    <Button type="button" variant="ghost" size="sm" @click="removeApproach(index)">
                        Remove
                    </Button>
                </div>

                <Input :model-value="item.title ?? ''" placeholder="Operational Accountability"
                    @update:model-value="updateApproach(index, 'title', $event)" />

                <Textarea :model-value="item.description ?? ''" rows="3"
                    placeholder="We promote clear responsibility across mining..."
                    @update:model-value="updateApproach(index, 'description', $event)" />
            </div>
        </div>
    </div>
</template>