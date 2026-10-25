export function FaqList({ faqs }: { faqs: { question: string; answer: string }[] }) {
  if (!faqs.length) return null
  return (
    <section className="mt-12">
      <h2 className="text-2xl font-black tracking-tight text-zinc-900">Common questions</h2>
      <div className="mt-4 divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white">
        {faqs.map((faq) => (
          <details key={faq.question} className="group px-4 py-3 md:px-5">
            <summary className="cursor-pointer list-none font-semibold text-zinc-900 marker:content-none">
              <span className="flex items-start justify-between gap-3">
                {faq.question}
                <span className="mt-0.5 text-zinc-400 group-open:hidden">+</span>
                <span className="mt-0.5 hidden text-zinc-400 group-open:inline">−</span>
              </span>
            </summary>
            <p className="mt-2 pb-1 text-sm leading-relaxed text-zinc-600">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
