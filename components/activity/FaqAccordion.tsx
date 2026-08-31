"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

interface FaqAccordionProps {
    faqs: { question: string; answer: string }[]
}

export function FaqAccordion({ faqs }: FaqAccordionProps) {
    const [activeIndex, setActiveIndex] = useState<number | null>(null)

    if (!faqs || faqs.length === 0) return null

    const toggleFaq = (index: number) => {
        setActiveIndex((prevActiveIndex) => {
            const indexExists = prevActiveIndex === index

            if (indexExists) {
                return null
            }

            return index
        })
    }

    return (
        <section>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <div className="space-y-2 md:space-y-3">
                {faqs.map((faq, index) => {
                    const isActive = activeIndex === index
                    return (
                        <div
                            key={index}
                            className={`rounded-2xl overflow-hidden transition-all duration-300 ${isActive
                                ? "bg-slate-50 border-2 border-slate-200 shadow-md"
                                : "bg-white border border-zinc-100 hover:border-zinc-200"
                                }`}
                        >
                            <div
                                onClick={() => toggleFaq(index)}
                                className="w-full flex items-center justify-between p-3.5 md:p-5 cursor-pointer font-bold text-slate-700/80 select-none text-left text-sm md:text-base"
                            >
                                <span>{faq.question}</span>
                                <span
                                    className={`transition-transform duration-300 flex-shrink-0 ml-4 ${isActive ? "text-rose-500" : "text-zinc-400"
                                        }`}
                                >
                                    {isActive ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                </span>
                            </div>

                            <div
                                className={`${isActive ? 'grid grid-rows-[1fr]' : 'grid grid-rows-[0fr]'} transition-all duration-300`}
                            >
                                <div className="overflow-hidden">
                                    <div className="px-3.5 pb-3.5 md:px-5 md:pb-5 text-sm font-medium text-slate-600/80 leading-relaxed">
                                        {faq.answer}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}
