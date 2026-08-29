const fs = require('fs');
const path = require('path');

const drawerPath = path.join(__dirname, 'components', 'activity', 'BookingDrawer.tsx');
let drawerContent = fs.readFileSync(drawerPath, 'utf8');

// 1. Remove Subtotal and Condense Totals Block
drawerContent = drawerContent.replace(
    /<div className="bg-zinc-50 py-2 px-4 rounded-2xl border border-zinc-100 mt-3">\s*<div className="flex justify-between items-center mb-1">\s*<span className="text-sm text-gray-500 font-normal">\s*Subtotal {pricingModel === 'per_day' && totalDays > 0 \? <span className="text-xs text-zinc-400 ml-1">\({totalDays} {totalDays === 1 \? 'day' : 'days'}\)<\/span> : ''}\s*<\/span>\s*<span className="font-medium text-lg text-zinc-900">{formatUSD\(totalUsd\)}<\/span>\s*<\/div>\s*{discountUsd > 0 && \(\s*<div className="flex justify-between items-center mb-1">\s*<span className="text-emerald-600 font-bold">Promo Discount<\/span>\s*<span className="font-bold text-lg text-emerald-600">-{formatUSD\(discountUsd\)}<\/span>\s*<\/div>\s*\)}\s*<div className="flex justify-between items-center mt-1 pt-1 border-t border-zinc-200">\s*<span className="text-zinc-800 font-bold">Total \(USD\)<\/span>\s*<span className="font-black text-2xl text-zinc-900">{formatUSD\(Math\.max\(0, totalUsd - discountUsd\)\)}<\/span>\s*<\/div>/g,
    `<div className="bg-zinc-50 py-2 px-4 rounded-2xl border border-zinc-100 mt-2">
                  {discountUsd > 0 && (
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-emerald-600 font-bold">Promo Discount</span>
                      <span className="font-bold text-lg text-emerald-600">-{formatUSD(discountUsd)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-800 font-bold">Total (USD)</span>
                    <span className="font-bold text-lg text-zinc-900">{formatUSD(Math.max(0, totalUsd - discountUsd))}</span>
                  </div>`
);

// 2. Tighten Form Gaps
drawerContent = drawerContent.replace(
    /<div className="flex-1 overflow-y-auto p-4 space-y-3">/g,
    `<div className="flex-1 overflow-y-auto p-4 space-y-2">`
);
drawerContent = drawerContent.replace(
    /{step === "details" && \(\s*<div className="space-y-3">\s*<div className="space-y-3">/g,
    `{step === "details" && (
            <div className="space-y-2">
              <div className="space-y-2">`
);

// 3. Elevate Calendar Z-Index and Prevent Keyboard Push
drawerContent = drawerContent.replace(
    /<Popover\.Content align="start" className="z-\[60\] bg-white rounded-xl shadow-lg border border-zinc-200 p-3 outline-none">/g,
    `<Popover.Content align="start" className="z-[999999] bg-white rounded-xl shadow-lg border border-zinc-200 p-3 outline-none">`
);
drawerContent = drawerContent.replace(
    /<button\s*className="w-full h-10 px-4 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500\/20 outline-none transition-all font-medium text-sm text-zinc-900 bg-white flex items-center justify-between"\s*>/g,
    `<button
                            type="button"
                            className="w-full h-10 px-4 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all font-medium text-sm text-zinc-900 bg-white flex items-center justify-between"
                          >`
);

fs.writeFileSync(drawerPath, drawerContent, 'utf8');
console.log('Successfully updated BookingDrawer.tsx');
