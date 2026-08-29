const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'activity', 'BookingDrawer.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Elevate the Modal Root
content = content.replace(
    /className="fixed inset-0 bg-zinc-900\/60 backdrop-blur-sm z-\[9999\] transition-opacity"/g,
    `className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-[99999] transition-opacity"`
);

content = content.replace(
    /className={`fixed inset-x-0 bottom-0 z-\[9999\] bg-white rounded-t-\[2\.5rem\] md:rounded-\[2\.5rem\] shadow-2xl transition-transform duration-300/g,
    `className={\`fixed inset-x-0 bottom-0 z-[99999] bg-white rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl transition-transform duration-300`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated BookingDrawer.tsx');
