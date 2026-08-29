const fs = require('fs');
const path = require('path');

const drawerPath = path.join(__dirname, 'components', 'activity', 'BookingDrawer.tsx');
let drawerContent = fs.readFileSync(drawerPath, 'utf8');

// 1. Responsive Footer Flex
drawerContent = drawerContent.replace(
    /<div className="flex flex-row items-center justify-between gap-4">/g,
    `<div className="flex flex-col-reverse md:flex-row items-center justify-between gap-4 w-full">`
);

// 2. Fix Mobile Button Width
drawerContent = drawerContent.replace(
    /className={`w-auto shrink-0 px-6 py-2\.5 text-lg font-bold rounded-xl transition-all shadow-xl shadow-rose-500\/20`}/g,
    `className={\`w-full md:w-auto shrink-0 px-6 py-3 text-lg font-bold rounded-xl transition-all shadow-xl shadow-rose-500/20\`}`
);

// 3. Restore Cancellation Policy
drawerContent = drawerContent.replace(
    /<p className="text-xs text-green-600 flex-1 text-left leading-tight">/g,
    `<p className="text-center md:text-left text-xs text-green-600 w-full leading-tight">`
);

// 4. Fix Subtotal Typography
drawerContent = drawerContent.replace(
    /<span className="text-zinc-600 font-medium">/g,
    `<span className="text-sm text-zinc-500 font-normal">`
);

// 5. Fix Safe Area Scrolling (Bottom Padding)
drawerContent = drawerContent.replace(
    /<div className="px-6 py-4 border-t border-zinc-100 bg-white shrink-0">/g,
    `<div className="px-6 pt-4 pb-8 md:pb-4 border-t border-zinc-100 bg-white shrink-0">`
);

fs.writeFileSync(drawerPath, drawerContent, 'utf8');
console.log('Successfully updated BookingDrawer.tsx');
