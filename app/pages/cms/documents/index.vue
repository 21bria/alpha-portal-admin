<template>
    <div class="relative min-h-[calc(100vh-56px)] w-full overflow-hidden px-12 pt-4 pb-4 lg:px-14">
        <!-- BIG BACKGROUND TEXT -->
        <div class="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
            <h1 class="select-none whitespace-nowrap text-center text-[110px] font-extrabold tracking-tight
        text-gray-900/5 dark:text-white/[0.035]
        md:text-[160px] xl:text-[210px]">
                Coming Soon
            </h1>
        </div>

    </div>
</template>

<style scoped>
button {
    transition: all 0.25s ease;
}

@keyframes fadeUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>