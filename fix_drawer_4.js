const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'activity', 'BookingDrawer.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace the header and add the absolute button
content = content.replace(
    /<div className="flex items-center justify-between w-full px-6 pt-6 pb-4 mb-4 border-b border-zinc-100 shrink-0">\s*<h2 className="text-xl font-bold text-zinc-900 tracking-tight">Complete Reservation<\/h2>\s*<button\s*type="button"\s*onClick={resetAndClose}\s*className="relative z-50 p-2 ml-auto cursor-pointer hover:bg-gray-100 rounded-full text-zinc-500 transition-colors"\s*>\s*<X className="w-5 h-5 pointer-events-none" \/>\s*<\/button>\s*<\/div>/g,
    `<button
          type="button"
          onClick={resetAndClose}
          className="absolute top-3 right-3 z-[99999] p-2 rounded-full bg-white hover:bg-gray-100 cursor-pointer transition-colors flex items-center justify-center text-zinc-500"
        >
          <X className="w-5 h-5 pointer-events-none" />
        </button>

        <div className="flex items-center justify-between w-full px-6 pt-6 pb-4 mb-4 border-b border-zinc-100 shrink-0">
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Complete Reservation</h2>
        </div>`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated BookingDrawer.tsx');
