"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

interface FaqAccordionProps {
    faqs: { question: string; answer: string }[]
}

export function FaqAccordion({ faqs }: FaqAccordionProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(null)

    if (!faqs || faqs.length === 0) return null

    return (
        <section>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-3">
                {faqs.map((faq, index) => {
                    const isActive = openIndex === index
                    return (
                        <details
                            key={index}
                            open={isActive}
                            className={`group rounded-2xl overflow-hidden transition-all duration-300 [&_summary::-webkit-details-marker]:hidden ${isActive
                                ? "bg-slate-50 border-2 border-slate-200 shadow-md"
                                : "bg-white border border-zinc-100 hover:border-zinc-200"
                                }`}
                        >
                            <summary
                                onClick={(e) => {
                                    e.preventDefault();
                                    setOpenIndex(openIndex === index ? null : index);
                                }}
                                className="w-full flex items-center justify-between p-4 cursor-pointer font-bold text-slate-700/80 select-none text-left"
                            >
                                <span>{faq.question}</span>
                                <span
                                    className={`transition-transform duration-300 flex-shrink-0 ml-4 ${isActive ? "rotate-180 text-rose-500" : "text-zinc-400"
                                        }`}
                                >
                                    <ChevronDown className="w-5 h-5" />
                                </span>
                            </summary>

                            <div className="px-4 pb-4 text-sm font-medium text-slate-600/80 leading-relaxed">
                                {faq.answer}
                            </div>
                        </details>
                    )
                })}
            </div>
        </section>
    )
}
