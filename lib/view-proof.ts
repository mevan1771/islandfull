export function travelerViewLabel(total: number, today: number) {
  const views = Math.max(0, Math.floor(total) || 0)
  const todayViews = Math.max(0, Math.floor(today) || 0)

  if (todayViews >= 3) return `${formatViewCount(todayViews)} today`
  if (views >= 1) return `${formatViewCount(views)} viewed`
  return "new"
}

export function formatViewCount(num: number) {
  if (num >= 1000) return `${(num / 1000).toFixed(1).replace(/\.0$/, "")}k`
  return String(num)
}

export function isLiveViewDay(viewsTodayOn: string | null | undefined) {
  if (!viewsTodayOn) return false
  return String(viewsTodayOn).slice(0, 10) === new Date().toISOString().slice(0, 10)
}
