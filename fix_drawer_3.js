const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'activity', 'BookingDrawer.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove Duplicate Banner
content = content.replace(
    /{\s*cancellationPolicy && \(\s*<div className="bg-emerald-50 py-1\.5 px-3 rounded-xl border border-emerald-200 mt-3 flex items-start gap-2">\s*<CheckCircle2 className="w-3\.5 h-3\.5 text-emerald-500 mt-0\.5 shrink-0" \/>\s*<p className="text-\[11px\] font-medium text-emerald-700 leading-tight">{cancellationPolicy}<\/p>\s*<\/div>\s*\)\s*}/g,
    ``
);

// 2. Fix Header Layout (Hitbox Issue)
content = content.replace(
    /<div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-zinc-100 shrink-0">/g,
    `<div className="flex items-center justify-between w-full px-6 pt-6 pb-4 mb-4 border-b border-zinc-100 shrink-0">`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated BookingDrawer.tsx');
