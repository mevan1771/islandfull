const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'app', 'activity', '[slug]', 'page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');

const oldInclusions = `<li key={i} className="flex items-start gap-2">
                                        <div className="mt-0.5 w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                                            <Check className="w-2.5 h-2.5 text-white" />
                                        </div>
                                        <span className="text-gray-700 text-sm font-medium leading-tight">{item}</span>
                                    </li>`;

const newInclusions = `<li key={i} className="flex items-start gap-3">
                                        <div className="mt-1 w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                                            <Check className="w-3 h-3 text-white" />
                                        </div>
                                        <span className="text-slate-700/80 text-base md:text-lg font-medium leading-tight">{item}</span>
                                    </li>`;

pageContent = pageContent.replace(oldInclusions, newInclusions);

fs.writeFileSync(pagePath, pageContent, 'utf8');
console.log('Successfully updated activity page.tsx');
