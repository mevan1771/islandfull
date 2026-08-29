const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'activity', 'BookingDrawer.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fix Close Button & Restructure Header
content = content.replace(
    /<div className="p-6 overflow-y-auto flex-1 overscroll-contain">\s*<div className="flex items-center justify-between mb-5">\s*<h2 className="text-xl font-bold text-zinc-900 tracking-tight">Complete Reservation<\/h2>\s*<button\s*onClick={resetAndClose}\s*className="p-2 rounded-full hover:bg-zinc-100 text-zinc-500 transition-colors bg-zinc-50"\s*>\s*<X className="w-5 h-5" \/>\s*<\/button>\s*<\/div>/g,
    `<div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-zinc-100 shrink-0">
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Complete Reservation</h2>
          <button
            onClick={resetAndClose}
            className="p-2 rounded-full hover:bg-zinc-100 text-zinc-500 transition-colors bg-zinc-50 cursor-pointer relative z-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 overflow-y-auto flex-1 overscroll-contain">`
);

// 2. Compress Form Spacing
content = content.replace(
    /{step === "details" && \(\s*<div className="space-y-5">\s*<div className="space-y-3">/g,
    `{step === "details" && (
            <div className="space-y-3">
              <div className="space-y-3">`
);

// 3. Shrink Textarea
content = content.replace(
    /rows={2}\s*className="w-full h-auto p-3 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500\/20 outline-none transition-all font-medium text-sm text-zinc-900 resize-none"/g,
    `rows={1}
                    className="w-full h-auto p-3 rounded-xl border border-zinc-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition-all font-medium text-sm text-zinc-900 resize-none"`
);

// 4. Condense Totals Block
content = content.replace(
    /className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100 mt-4"/g,
    `className="bg-zinc-50 py-2 px-4 rounded-2xl border border-zinc-100 mt-3"`
);
content = content.replace(
    /className="flex justify-between items-center mt-2 pt-2 border-t border-zinc-200"/g,
    `className="flex justify-between items-center mt-1 pt-1 border-t border-zinc-200"`
);
content = content.replace(
    /className="flex justify-between items-center mt-1"/g,
    `className="flex justify-between items-center mt-0.5"`
);

// 5. Condense Refund Banner
content = content.replace(
    /className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 mt-4 flex items-start gap-2"/g,
    `className="bg-emerald-50 py-1.5 px-3 rounded-xl border border-emerald-200 mt-3 flex items-start gap-2"`
);
content = content.replace(
    /<CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" \/>/g,
    `<CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />`
);
content = content.replace(
    /<p className="text-xs font-medium text-emerald-700">{cancellationPolicy}<\/p>/g,
    `<p className="text-[11px] font-medium text-emerald-700 leading-tight">{cancellationPolicy}</p>`
);

// 6. Sticky Footer
// We need to move the button out of the scrollable area.
// Find the end of the details step and insert the sticky footer.
// This is a bit tricky with regex, so let's just replace the button section.
content = content.replace(
    /<Button\s*onClick={\(e\) => { e\.preventDefault\(\); handleStripeCheckout\(\); }}\s*disabled={\(bookingType === 'multi_day' \? !dateRange\?\.from : !date\) \|\| !whatsapp \|\| !touristName \|\| !touristEmail}\s*className={`w-full h-14 text-lg font-bold rounded-xl transition-all shadow-xl shadow-rose-500\/20`}\s*>\s*{priceUsd === 0\s*\?\s*"Complete Reservation"\s*:\s*"Proceed to Payment"}\s*<\/Button>\s*<\/div>\s*\)}/g,
    `</div>
          )}`
);

// And add the sticky footer at the end of the modal content
content = content.replace(
    /<\/div>\s*<\/div>\s*<\/>\s*\)\s*}\s*$/g,
    `</div>
        
        {/* Sticky Footer */}
        <div className="px-6 py-4 border-t border-zinc-100 bg-white shrink-0">
          {step === "details" && (
            <Button
              onClick={(e) => { e.preventDefault(); handleStripeCheckout(); }}
              disabled={(bookingType === 'multi_day' ? !dateRange?.from : !date) || !whatsapp || !touristName || !touristEmail}
              className={\`w-full h-14 text-lg font-bold rounded-xl transition-all shadow-xl shadow-rose-500/20\`}
            >
              {priceUsd === 0
                ? "Complete Reservation"
                : "Proceed to Payment"}
            </Button>
          )}
          {step === "success" && (
            <Button onClick={resetAndClose} className="w-full h-14 rounded-xl font-bold text-lg" variant="outline">
              Back to Activity
            </Button>
          )}
        </div>
      </div>
    </>
  )
}
`
);

// Also remove the success button from the success step since it's now in the sticky footer
content = content.replace(
    /<Button onClick={resetAndClose} className="w-full h-16 rounded-2xl font-bold text-lg" variant="outline">\s*Back to Activity\s*<\/Button>\s*<\/div>\s*\)}/g,
    `</div>
          )}`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated BookingDrawer.tsx');
