export function formatDateTime(
  value?: string | null,
  locale = "id-ID"
) {
  if (!value) return "-"

  return new Date(value).toLocaleString(locale, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatDate(
  value?: string | null,
  locale = "id-ID"
) {
  if (!value) return "-"

  return new Date(value).toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  })
}

export function formatTime(
  value?: string | null,
  locale = "id-ID"
) {
  if (!value) return "-"

  return new Date(value).toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  })
}