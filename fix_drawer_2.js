const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'activity', 'BookingDrawer.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fix Z-Index Bleed
content = content.replace(
    /className="fixed inset-0 bg-zinc-900\/60 backdrop-blur-sm z-50 transition-opacity"/g,
    `className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-[9999] transition-opacity"`
);

content = content.replace(
    /className={`fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-\[2\.5rem\] md:rounded-\[2\.5rem\] shadow-2xl transition-transform duration-300/g,
    `className={\`fixed inset-x-0 bottom-0 z-[9999] bg-white rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl transition-transform duration-300`
);

// 2. Force 'X' Button Interaction
content = content.replace(
    /<button\s*onClick={resetAndClose}\s*className="p-2 rounded-full hover:bg-zinc-100 text-zinc-500 transition-colors bg-zinc-50 cursor-pointer relative z-50"\s*>\s*<X className="w-5 h-5" \/>\s*<\/button>/g,
    `<button
            type="button"
            onClick={resetAndClose}
            className="relative z-50 p-2 ml-auto cursor-pointer hover:bg-gray-100 rounded-full text-zinc-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>`
);

// 3. Remove Cancellation Policy from scrollable area
content = content.replace(
    /{\s*cancellationPolicy && \(\s*<div className="bg-emerald-50 py-1\.5 px-3 rounded-xl border border-emerald-200 mt-3 flex items-start gap-2">\s*<CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0\.5 shrink-0" \/>\s*<p className="text-xs font-medium text-emerald-700">{cancellationPolicy}<\/p>\s*<\/div>\s*\)\s*}/g,
    ``
);

// 4. Inline Footer Redesign
content = content.replace(
    /<div className="px-6 py-4 border-t border-zinc-100 bg-white shrink-0">\s*{step === "details" && \(\s*<Button\s*onClick={\(e\) => { e\.preventDefault\(\); handleStripeCheckout\(\); }}\s*disabled={\(bookingType === 'multi_day' \? !dateRange\?\.from : !date\) \|\| !whatsapp \|\| !touristName \|\| !touristEmail}\s*className={`w-full h-14 text-lg font-bold rounded-xl transition-all shadow-xl shadow-rose-500\/20`}\s*>\s*{priceUsd === 0\s*\?\s*"Complete Reservation"\s*:\s*"Proceed to Payment"}\s*<\/Button>\s*\)}/g,
    `<div className="px-6 py-4 border-t border-zinc-100 bg-white shrink-0">
          {step === "details" && (
            <div className="flex flex-row items-center justify-between gap-4">
              {cancellationPolicy && (
                <p className="text-xs text-green-600 flex-1 text-left leading-tight">
                  {cancellationPolicy}
                </p>
              )}
              <Button
                onClick={(e) => { e.preventDefault(); handleStripeCheckout(); }}
                disabled={(bookingType === 'multi_day' ? !dateRange?.from : !date) || !whatsapp || !touristName || !touristEmail}
                className={\`w-auto shrink-0 px-6 py-2.5 text-lg font-bold rounded-xl transition-all shadow-xl shadow-rose-500/20\`}
              >
                {priceUsd === 0
                  ? "Complete Reservation"
                  : "Proceed to Payment"}
              </Button>
            </div>
          )}`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated BookingDrawer.tsx');
