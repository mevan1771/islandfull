export function travelerViewLine(total: number, today: number, kind: "tour" | "place" = "tour") {
  const views = Math.max(0, Math.floor(total) || 0)
  const todayViews = Math.max(0, Math.floor(today) || 0)

  if (todayViews >= 8) {
    return `${todayViews} travelers viewed this today`
  }
  if (todayViews >= 3) {
    return `${todayViews} travelers have been looking at this today`
  }
  if (todayViews === 2) {
    return "Two travelers viewed this today"
  }
  if (todayViews === 1 && views >= 5) {
    return "Someone just looked at this"
  }
  if (views >= 40) {
    return `${views} travelers have viewed this`
  }
  if (views >= 8) {
    return `This one’s getting looks — ${views} travelers have viewed it`
  }
  if (views >= 1) {
    return "Travelers are starting to find this"
  }
  return kind === "place" ? "Be one of the first to explore this" : "Be one of the first to book this"
}

export function isLiveViewDay(viewsTodayOn: string | null | undefined) {
  if (!viewsTodayOn) return false
  return String(viewsTodayOn).slice(0, 10) === new Date().toISOString().slice(0, 10)
}
