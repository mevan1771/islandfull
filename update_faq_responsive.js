const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'activity', 'FaqAccordion.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Spacing between items
content = content.replace(
    `<div className="space-y-3">`,
    `<div className="space-y-2 md:space-y-3">`
);

// 2. Padding and typography for the question (summary)
const oldSummary = `className="w-full flex items-center justify-between p-4 cursor-pointer font-bold text-slate-700/80 select-none text-left"`;
const newSummary = `className="w-full flex items-center justify-between p-3.5 md:p-5 cursor-pointer font-bold text-slate-700/80 select-none text-left text-sm md:text-base"`;
content = content.replace(oldSummary, newSummary);

// 3. Padding for the answer
const oldAnswer = `<div className="px-4 pb-4 text-sm font-medium text-slate-600/80 leading-relaxed">`;
const newAnswer = `<div className="px-3.5 pb-3.5 md:px-5 md:pb-5 text-sm font-medium text-slate-600/80 leading-relaxed">`;
content = content.replace(oldAnswer, newAnswer);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated FaqAccordion.tsx');
