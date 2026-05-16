<template>
  <div class="relative min-h-[calc(100vh-56px)] w-full overflow-hidden px-12 pt-4 pb-4 lg:px-14">
    <!-- CONTENT -->
    <div class="relative z-10 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <!-- HEADER + FILTER -->
      <div class="flex flex-col gap-2">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 class="text-xl font-semibold tracking-tight">
              Application Launcher
            </h2>
            <p class="text-xs text-muted-foreground">
              Select application menu based.
            </p>
          </div>

        </div>

        <div class="grid grid-cols-12 gap-5 pt-6">
          <!-- LEFT: APP LAUNCHER -->
          <div class="col-span-12 xl:col-span-7">
            <!-- <p class="text-xs">
              role: {{ auth.user?.role }}
            </p>
            <pre class="text-xs">
              {{ JSON.stringify(auth.iupAccess, null, 2) }}
            </pre> -->
            <div
              class="w-full rounded-[1.35rem] border bg-gradient-to-br from-background via-muted/20 to-background px-4 py-6 shadow-sm sm:px-6 sm:py-5">
              <div 
                class="mx-auto grid max-w-4xl grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-y-8 gap-x-5 justify-items-center">
                <button v-for="item in appMenus" :key="item.key" type="button"
                  class="group flex min-w-0 flex-col items-center justify-start gap-2 p-1 text-center transition-all duration-300 hover:scale-105 active:scale-95"
                  @click="openAppMenu(item)">
                  <div
                    class="flex h-14 w-14 items-center justify-center rounded-[1.35rem] shadow-lg ring-1 ring-white/15 transition-all duration-300 group-hover:scale-110 sm:h-16 sm:w-16 sm:rounded-[1.5rem]"
                    :class="item.iconClass">
                    <component :is="item.icon" class="h-7 w-7 text-white sm:h-8 sm:w-8" />
                  </div>

                  <div class="max-w-full min-w-0">
                    <p class="truncate text-[12px] font-medium leading-tight sm:text-sm">
                      {{ item.label }}
                    </p>
                    <p class="mt-0.5 hidden truncate text-[11px] text-muted-foreground sm:block">
                      {{ item.description }}
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <!-- RIGHT: DASHBOARD INFO CARD -->
          <div class="col-span-12 xl:col-span-5">
            <div
              class="relative h-full min-h-[265px] overflow-hidden rounded-[1.75rem] border bg-gradient-to-br from-slate-950 via-slate-900 to-background p-7 shadow-sm">
              <div class="relative z-10 flex h-full flex-col justify-between gap-6">
                <div>
                  <p class="text-xs font-medium uppercase tracking-[0.25em] text-orange-400">
                    Company Portal CMS
                  </p>

                  <h1 class="mt-4 max-w-md text-3xl font-bold leading-tight text-white">
                    Manage company portal, projects, careers, news, and digital content in one workspace.
                  </h1>

                  <p class="mt-4 max-w-lg text-sm leading-6 text-slate-400">
                    Control public portal content, company pages, mining projects,
                    documents, and recruitment modules from one centralized CMS platform.
                  </p>
                </div>
              </div>

              <div class="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-orange-500/20 blur-3xl" />
              <div class="absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-emerald-500/10 blur-3xl" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- BACKGROUND BIG TEXT INSIDE INDEX FRAME -->
    <div class="pointer-events-none absolute inset-x-0 bottom-0 z-0 overflow-hidden">
      <h1 class="translate-y-8 select-none whitespace-nowrap text-center text-[110px] font-extrabold tracking-tight
           text-gray-900/5 dark:text-white/[0.035]
           md:text-[110px] xl:text-[130px]">
        CMS Applications
      </h1>

      <div class="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from "vue"
import { useRouter } from 'vue-router'
import { useAuthStore } from "~/stores/auth"

const auth = useAuthStore()
import { toast } from 'vue-sonner'

// const auth = useAuthStore()
const router = useRouter()



import {
  Newspaper,
  LayoutTemplate,
  FolderKanban,
  BriefcaseBusiness,
  Files,
  Building2,
  Images,
  MapPinned
} from 'lucide-vue-next'

type AppMenuItem = {
  key: string
  label: string
  description: string
  path: string
  icon: any
  iconClass: string

  require?: {
    any?: string[]
    all?: string[]
  }

}

function canAccess(require?: AppMenuItem["require"]) {
  if (!require) return true

  const perms = auth.user?.permissions ?? []

  if (require.any?.length) {
    return require.any.some((p) => perms.includes(p))
  }

  if (require.all?.length) {
    return require.all.every((p) => perms.includes(p))
  }

  return true
}

const appMenus: AppMenuItem[] = [
  {
    key: 'home',
    label: 'Home Pages',
    description: 'Landing page sections',
    path: '/static/page',
    icon: LayoutTemplate,
    iconClass: 'bg-gradient-to-br from-orange-400 to-orange-600',
     require: { any: ["cms.view_page"] },
  },

  {
    key: 'news',
    label: 'News',
    description: 'News & articles',
    path: '/cms/news/article',
    icon: Newspaper,
    iconClass: 'bg-gradient-to-br from-sky-400 to-blue-600',
    require: { any: ["cms.view_newsarticle"] },
  },

  {
    key: 'projects',
    label: 'Projects',
    description: 'Mining projects',
    path: '/cms/projects',
    icon: FolderKanban,
    iconClass: 'bg-gradient-to-br from-green-400 to-green-600',
    require: { any: ["cms.view_project"] },
  },

  {
    key: 'careers',
    label: 'Careers',
    description: 'Job vacancies',
    path: '/careers',
    icon: BriefcaseBusiness,
    iconClass: 'bg-gradient-to-br from-violet-400 to-purple-600',
    require: { any: ["cms.view_jobvacancy"] },
  },

  {
    key: 'documents',
    label: 'Documents',
    description: 'Company documents',
    path: '/cms/documents',
    icon: Files,
    iconClass: 'bg-gradient-to-br from-amber-400 to-yellow-600',
    require: { any: ["cms.view_document"] },
  },

  {
    key: 'company',
    label: 'Company',
    description: 'Company profile',
    path: '/profile',
    icon: Building2,
    iconClass: 'bg-gradient-to-br from-red-400 to-red-600',
    require: { any: ["cms.view_companyprofile"] },
  },

  {
    key: 'gallery',
    label: 'Gallery',
    description: 'Hero & portal galley',
    path: '/media/library',
    icon: Images,
    iconClass: 'bg-gradient-to-br from-pink-400 to-rose-600',
    require: { any: ["cms.view_media"] },
  },

  // {
  //   key: 'gis',
  //   label: 'GIS Projects',
  //   description: 'Mine location maps',
  //   path: '/cms/gis-projects',
  //   icon: MapPinned,
  //   iconClass: 'bg-gradient-to-br from-emerald-400 to-teal-600'
  // }
]

const visibleAppMenus = computed(() => {
  return appMenus.filter((item) => canAccess(item.require))
})

function openAppMenu(item: AppMenuItem) {
  if (!canAccess(item.require)) {
    toast.error("You don't have permission to access this menu")
    return
  }

  router.push({ path: item.path })
}

</script>

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