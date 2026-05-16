export type UserRole = "SYSTEM" | "GLOBAL_VIEWER" | "ADMIN_USER"

export function normalizeRole(v: unknown): UserRole {
  const raw = String(v ?? "").trim().toUpperCase()

  if (raw === "SYSTEM") return "SYSTEM"
  if (raw === "GLOBAL_VIEWER") return "GLOBAL_VIEWER"
  if (raw === "ADMIN_USER") return "ADMIN_USER"

  if (raw === "SUPER_ADMIN" || raw === "SUPERADMIN" || raw === "ADMIN") {
    return "SYSTEM"
  }

  return "ADMIN_USER"
}