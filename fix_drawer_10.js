const fs = require('fs');
const path = require('path');

const drawerPath = path.join(__dirname, 'components', 'activity', 'BookingDrawer.tsx');
let drawerContent = fs.readFileSync(drawerPath, 'utf8');

// 1. The 3-Part Rigid Layout (Main Wrapper)
drawerContent = drawerContent.replace(
    /className={`fixed inset-x-0 bottom-0 z-\[99999\] bg-white rounded-t-\[2\.5rem\] md:rounded-\[2\.5rem\] shadow-2xl transition-transform duration-300 ease-\[cubic-bezier\(0\.32,0\.72,0,1\)\] flex flex-col md:w-full md:max-w-lg md:top-1\/2 md:-translate-y-1\/2 md:left-1\/2 md:-translate-x-1\/2 md:bottom-auto md:h-auto max-h-\[85dvh\] overflow-hidden \${isOpen \? "translate-y-0" : "translate-y-full md:translate-y-\[150%\]"\s*}`}/g,
    `className={\`flex flex-col fixed inset-x-0 bottom-0 max-h-[90dvh] bg-white overflow-hidden rounded-t-xl md:w-full md:max-w-lg md:top-1/2 md:-translate-y-1/2 md:left-1/2 md:-translate-x-1/2 md:bottom-auto md:rounded-2xl shadow-2xl transition-transform duration-300 \${isOpen ? "translate-y-0" : "translate-y-full md:translate-y-[150%]"}\`}`
);

// 2. Zone 1 - Fixed Header
drawerContent = drawerContent.replace(
    /<button\s*type="button"\s*onClick={resetAndClose}\s*className="absolute top-3 right-3 z-\[99999\] p-2 rounded-full bg-white hover:bg-gray-100 cursor-pointer transition-colors flex items-center justify-center text-zinc-500"\s*>\s*<X className="w-5 h-5 pointer-events-none" \/>\s*<\/button>\s*<div className="flex items-center justify-between w-full px-6 pt-6 pb-4 mb-4 border-b border-zinc-100 shrink-0">\s*<h2 className="text-xl font-bold text-zinc-900 tracking-tight">Complete Reservation<\/h2>\s*<\/div>/g,
    `<div className="shrink-0 p-4 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Complete Reservation</h2>
          <button
            type="button"
            onClick={resetAndClose}
            className="p-2 rounded-full hover:bg-gray-100 cursor-pointer transition-colors flex items-center justify-center text-zinc-500"
          >
            <X className="w-5 h-5 pointer-events-none" />
          </button>
        </div>`
);

// 3. Zone 2 - Scrollable Body
drawerContent = drawerContent.replace(
    /<div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">/g,
    `<div className="flex-1 overflow-y-auto p-4 space-y-3">`
);

// 4. Zone 3 - Pinned Footer
drawerContent = drawerContent.replace(
    /{\/\* Sticky Footer \*\/}\s*<div className="shrink-0 p-4 bg-white border-t border-gray-100 flex flex-col-reverse md:flex-row items-center justify-between gap-3">/g,
    `{/* Sticky Footer */}
        <div className="shrink-0 p-4 border-t border-gray-100 bg-white flex flex-col-reverse md:flex-row gap-4 items-center justify-between pb-safe">`
);

fs.writeFileSync(drawerPath, drawerContent, 'utf8');
console.log('Successfully updated BookingDrawer.tsx');
