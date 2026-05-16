import { defineStore } from "pinia"

type LoginResponse = {
  access: string
  refresh: string
  user?: any
}

type MeResponse = {
  user: any
}

const apiUrl = (baseURL: string, path: string) => {
  const base = String(baseURL || "").replace(/\/$/, "")

  const baseHasApi = base.endsWith("/api")
  const pathHasApi = /^\/?api\//.test(path)

  let cleanPath = path

  if (baseHasApi && pathHasApi) {
    cleanPath = path.replace(/^\/?api\//, "/")
  }

  const normalizedPath = cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`

  return `${base}${normalizedPath}`
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    access: "" as string,
    refresh: "" as string,
    user: null as any,
    meLoaded: false as boolean,
    mePromise: null as Promise<any> | null,
  }),

  getters: {
    isAuthed: (s) => !!s.access,
  },

  actions: {
    loadFromStorage() {
      const accessCookie = useCookie<string | null>("access", { sameSite: "lax" })
      const refreshCookie = useCookie<string | null>("refresh", { sameSite: "lax" })

      this.access = accessCookie.value ?? ""
      this.refresh = refreshCookie.value ?? ""

      if (import.meta.server) return

      const safeParse = (v: string | null) => {
        if (!v || v === "undefined" || v === "null") return null
        try {
          return JSON.parse(v)
        } catch {
          return null
        }
      }

      this.user = safeParse(localStorage.getItem("user"))

      const hasPerms = Array.isArray(this.user?.permissions)

      this.meLoaded = !!(this.access && this.user && hasPerms)

    },

    saveToStorage() {
      const accessCookie = useCookie<string | null>("access", { sameSite: "lax" })
      const refreshCookie = useCookie<string | null>("refresh", { sameSite: "lax" })

      accessCookie.value = this.access ? this.access : null
      refreshCookie.value = this.refresh ? this.refresh : null

      if (import.meta.server) return

      if (this.user == null) localStorage.removeItem("user")
      else localStorage.setItem("user", JSON.stringify(this.user))

    },

    clear() {
      const accessCookie = useCookie<string | null>("access", { sameSite: "lax" })
      const refreshCookie = useCookie<string | null>("refresh", { sameSite: "lax" })

      accessCookie.value = null
      refreshCookie.value = null

      this.access = ""
      this.refresh = ""
      this.user = null
      this.meLoaded = false
      this.mePromise = null

      if (import.meta.client) {
        localStorage.removeItem("user")
      }
    },

    async login(username: string, password: string) {
      const config = useRuntimeConfig()
      const baseURL = config.public.apiBaseUrl

      try {
        const res = await $fetch<LoginResponse>(apiUrl(baseURL, "/api/auth/login/"), {
          method: "POST",
          body: { username, password },
        })

        this.access = res.access
        this.refresh = res.refresh
        this.user = res.user ?? this.user

        this.meLoaded = false

        this.saveToStorage()

        await this.fetchMe()
      } catch (e: any) {
        const msg =
          e?.data?.detail ||
          (Array.isArray(e?.data?.non_field_errors) ? e.data.non_field_errors[0] : null) ||
          "Username atau password salah"
        throw new Error(msg)
      }
    },

    async fetchMe() {
      const hasPerms = Array.isArray(this.user?.permissions)

      if (this.meLoaded && hasPerms) {
        return { user: this.user}
      }

      if (this.mePromise) return this.mePromise

      this.mePromise = (async () => {
        const { request } = useApi()
        const res = await request<MeResponse>("/api/auth/me/", { method: "GET" })

        this.user = res.user

        this.meLoaded = Array.isArray(this.user?.permissions)


        this.saveToStorage()
        return res
      })()

      try {
        return await this.mePromise
      } finally {
        this.mePromise = null
      }
    },

    async refreshToken() {
      if (!this.refresh) throw new Error("No refresh token")

      const config = useRuntimeConfig()
      const baseURL = config.public.apiBaseUrl

      const res = await $fetch<{ access: string }>(apiUrl(baseURL, "/api/auth/refresh/"), {
        method: "POST",
        body: { refresh: this.refresh },
      })

      this.access = res.access
      this.saveToStorage()
      return this.access
    },
  },
})