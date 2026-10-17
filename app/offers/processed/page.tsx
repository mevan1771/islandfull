export default async function OfferProcessedPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams

  const copy =
    status === "accepted"
      ? {
          title: "Offer accepted",
            body: "The guest has been emailed. They have 24 hours to pay and confirm.",
        }
      : status === "declined"
        ? {
            title: "Offer declined",
            body: "The guest has been emailed. No further action needed.",
          }
        : status === "expired"
          ? {
              title: "Offer expired",
              body: "This price was only held for 24 hours. Send a new offer from the listing if you still want to stay.",
            }
          : {
            title: "Already processed",
            body: "This offer was already accepted or declined, or the link is invalid.",
          }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 bg-zinc-50">
      <div className="max-w-md w-full bg-white rounded-3xl border border-zinc-200 shadow-sm p-8 text-center">
        <h1 className="text-2xl font-bold text-zinc-900">{copy.title}</h1>
        <p className="text-zinc-500 mt-3">{copy.body}</p>
      </div>
    </div>
  )
}
