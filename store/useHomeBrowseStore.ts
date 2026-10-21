import { create } from "zustand"
import { emptyHomepageCategoryMap, type HomepageCategory, type HomepageCategoryMap, type PublicVertical } from "@/lib/homepage-feed"

type State = {
  vertical: PublicVertical
  categories: HomepageCategoryMap
  setVertical: (vertical: PublicVertical) => void
  hydrateCategories: (map: Partial<HomepageCategoryMap>) => void
}

export const useHomeBrowseStore = create<State>((set) => ({
  vertical: "tour",
  categories: emptyHomepageCategoryMap(),
  setVertical: (vertical) => set((state) => (state.vertical === vertical ? state : { vertical })),
  hydrateCategories: (map) =>
    set((state) => ({
      categories: {
        tour: map.tour?.length ? map.tour : state.categories.tour,
        transport: map.transport?.length ? map.transport : state.categories.transport,
        hotel: map.hotel?.length ? map.hotel : state.categories.hotel,
      },
    })),
}))

export function useHomeBrowseCategories(fallback: HomepageCategory[] = []) {
  const vertical = useHomeBrowseStore((s) => s.vertical)
  const cached = useHomeBrowseStore((s) => s.categories[vertical])
  return cached.length ? cached : fallback
}
