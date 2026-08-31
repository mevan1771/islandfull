const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'activity', 'FaqAccordion.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const oldDetails = `<details
                            key={index}
                            open={isActive}
                            className={\`group rounded-2xl overflow-hidden transition-all duration-300 [&_summary::-webkit-details-marker]:hidden \${isActive
                                ? "bg-slate-50 border-2 border-slate-200 shadow-md"
                                : "bg-white border border-zinc-100 hover:border-zinc-200"
                                }\`}
                        >
                            <summary
                                onClick={(e) => {
                                    e.preventDefault();
                                    setOpenIndex(openIndex === index ? null : index);
                                }}
                                className="w-full flex items-center justify-between p-4 cursor-pointer font-bold text-slate-700/80 select-none text-left"
                            >`;

const newDetails = `<details
                            key={index}
                            name="faq-accordion"
                            open={isActive}
                            onToggle={(e) => {
                                if ((e.currentTarget as HTMLDetailsElement).open) {
                                    setOpenIndex(index);
                                } else if (openIndex === index) {
                                    setOpenIndex(null);
                                }
                            }}
                            className={\`group rounded-2xl overflow-hidden transition-all duration-300 [&_summary::-webkit-details-marker]:hidden \${isActive
                                ? "bg-slate-50 border-2 border-slate-200 shadow-md"
                                : "bg-white border border-zinc-100 hover:border-zinc-200"
                                }\`}
                        >
                            <summary
                                className="w-full flex items-center justify-between p-4 cursor-pointer font-bold text-slate-700/80 select-none text-left"
                            >`;

content = content.replace(oldDetails, newDetails);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated FaqAccordion.tsx');
