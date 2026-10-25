export type InclusionItem = {
  text: string
  icon_url: string | null
}

export function zipInclusionItems(
  inclusions?: string[] | null,
  inclusion_icons?: (string | null | undefined)[] | null
): InclusionItem[] {
  return (inclusions || [])
    .map((text) => String(text || "").trim())
    .filter(Boolean)
    .map((text, i) => ({
      text,
      icon_url: String(inclusion_icons?.[i] || "").trim() || null,
    }))
}

export function parseInclusionForm(formData: FormData) {
  const lines = String(formData.get("inclusions") || "").split("\n")
  let icons: unknown[] = []
  try {
    const raw = formData.get("inclusion_icons")
    if (raw) icons = JSON.parse(String(raw))
  } catch {
    icons = []
  }
  const items = lines
    .map((line, i) => ({
      text: line.trim(),
      icon_url: String(Array.isArray(icons) ? icons[i] || "" : "").trim() || null,
    }))
    .filter((row) => row.text)

  return {
    inclusions: items.map((item) => item.text),
    inclusion_icons: items.map((item) => item.icon_url),
  }
}
