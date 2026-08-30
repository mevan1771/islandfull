const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'app', 'activity', '[slug]', 'page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');

// Add FAQ section
const faqSection = `
                    {/* FAQs */}
                    {activity.faqs && activity.faqs.length > 0 && (
                        <section>
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                            <div className="space-y-3">
                                {activity.faqs.map((faq: any, i: number) => (
                                    <details key={i} className="group bg-zinc-50 border border-zinc-100 rounded-2xl overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                                        <summary className="flex items-center justify-between p-4 cursor-pointer font-bold text-slate-700/80 select-none">
                                            <span>{faq.question}</span>
                                            <span className="transition-transform duration-300 group-open:-rotate-180 text-rose-500">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                                            </span>
                                        </summary>
                                        <div className="px-4 pb-4 text-sm font-medium text-slate-600/80 leading-relaxed">
                                            {faq.answer}
                                        </div>
                                    </details>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Photo Gallery */}`;

pageContent = pageContent.replace(
    /\{\/\* Photo Gallery \*\/\}/,
    faqSection
);

fs.writeFileSync(pagePath, pageContent, 'utf8');
console.log('Successfully updated activity page.tsx');
