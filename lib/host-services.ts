export const HOST_SERVICE_TYPES = [
  { id: "tour", label: "Tours" },
  { id: "transport", label: "Transport" },
  { id: "hotel", label: "Hotels" },
] as const

export type HostServiceType = (typeof HOST_SERVICE_TYPES)[number]["id"]

const ALLOWED = new Set(HOST_SERVICE_TYPES.map((item) => item.id))

export function parseServiceTypes(raw: unknown): HostServiceType[] {
  const list = Array.isArray(raw)
    ? raw
    : typeof raw === "string"
      ? raw.split(",")
      : []
  const unique = [...new Set(list.map(String).filter((id): id is HostServiceType => ALLOWED.has(id as HostServiceType)))]
  return unique.length ? unique : ["tour"]
}

export function hostOffers(host: { service_types?: unknown } | null | undefined, type: HostServiceType) {
  const types = parseServiceTypes(host?.service_types)
  return types.includes(type)
}
