import tailwindcss from '@tailwindcss/vite';
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true,
  devtools: {
    enabled: import.meta.dev,
  },
  css: ['~/assets/css/tailwind.css'],
  vite: {
    plugins: [tailwindcss()]
  },
  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.NUXT_PUBLIC_API_BASE_URL || '/api',
    },
  },
  components: [
    {
      path: '~/components',
      extensions: ['.vue']
    }
  ],

  modules: [
    'shadcn-nuxt',
    '@vueuse/nuxt',
    '@nuxt/eslint',
    '@nuxt/icon',
    '@pinia/nuxt',
    '@nuxtjs/color-mode',
    '@nuxt/fonts',
    '@nuxthub/core',
    '@nuxt/ui'
  ],

  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * @default "~/components/ui"
     */
    componentDir: '~/components/ui'
  },

  colorMode: {
    classSuffix: ''
  },

  eslint: {
    config: {
      standalone: false
    }
  },

  fonts: {
    defaults: {
      weights: [300, 400, 500, 600, 700, 800]
    }
  },

  routeRules: {
    '/components': { redirect: '/components/accordion' },
    '/settings': { redirect: '/settings/profile' }
  },

  imports: {
    dirs: ['./lib']
  },

  compatibilityDate: '2026-03-13',

  nitro: {
    prerender: {
      ignore: [
        '/examples/forms',
        '/terms',
        '/privacy',
        '/components/pagination',
        '/docs'
      ]
    }
  },
  app: {
    baseURL: '/'
  }
});
