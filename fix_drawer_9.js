const fs = require('fs');
const path = require('path');

const drawerPath = path.join(__dirname, 'components', 'activity', 'BookingDrawer.tsx');
let drawerContent = fs.readFileSync(drawerPath, 'utf8');

// 1. Strict Flex Architecture (Update max-h)
drawerContent = drawerContent.replace(
    /max-h-\[90vh\]/g,
    `max-h-[85dvh]`
);

// 2. Scrollable Form Body
drawerContent = drawerContent.replace(
    /<div className="px-6 py-4 overflow-y-auto flex-1 overscroll-contain">/g,
    `<div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">`
);

// 3. Pinned Footer
drawerContent = drawerContent.replace(
    /{\/\* Sticky Footer \*\/}\s*<div className="px-6 pt-4 pb-8 md:pb-4 border-t border-zinc-100 bg-white shrink-0">\s*{step === "details" && \(\s*<div className="flex flex-col-reverse md:flex-row items-center justify-between gap-4 w-full">/g,
    `{/* Sticky Footer */}
        <div className="shrink-0 p-4 bg-white border-t border-gray-100 flex flex-col-reverse md:flex-row items-center justify-between gap-3">
          {step === "details" && (
            <>`
);

// 4. Restore Cancellation Text
drawerContent = drawerContent.replace(
    /{\s*cancellationPolicy && \(\s*<p className="text-center md:text-left text-xs text-green-600 w-full leading-tight">\s*{cancellationPolicy}\s*<\/p>\s*\)\s*}/g,
    `{cancellationPolicy && (
                <p className="text-xs text-center md:text-left text-green-600 w-full">
                  {cancellationPolicy}
                </p>
              )}`
);

// 5. Force Full-Width Button (Already correct, but just in case)
drawerContent = drawerContent.replace(
    /className={`w-full md:w-auto shrink-0 px-6 py-3 text-lg font-bold rounded-xl transition-all shadow-xl shadow-rose-500\/20`}/g,
    `className={\`w-full md:w-auto shrink-0 px-6 py-3 text-lg font-bold rounded-xl transition-all shadow-xl shadow-rose-500/20\`}`
);

// Close the fragment for step === "details"
drawerContent = drawerContent.replace(
    /<\/Button>\s*<\/div>\s*\)\s*}/g,
    `</Button>
            </>
          )}`
);

// 6. Fix Subtotal Typography
drawerContent = drawerContent.replace(
    /<span className="text-sm text-zinc-500 font-normal">/g,
    `<span className="text-sm text-gray-500 font-normal">`
);

fs.writeFileSync(drawerPath, drawerContent, 'utf8');
console.log('Successfully updated BookingDrawer.tsx');
