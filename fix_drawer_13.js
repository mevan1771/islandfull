const fs = require('fs');
const path = require('path');

const drawerPath = path.join(__dirname, 'components', 'activity', 'BookingDrawer.tsx');
let drawerContent = fs.readFileSync(drawerPath, 'utf8');

// 1 & 2. Center Alignment and Responsive Full Width
drawerContent = drawerContent.replace(
    /<Popover\.Content align="start" className="z-\[999999\] bg-white rounded-xl shadow-lg border border-zinc-200 p-3 outline-none">/g,
    `<Popover.Content align="center" className="z-[999999] bg-white rounded-xl shadow-lg border border-zinc-200 p-3 outline-none w-[calc(100vw-2rem)] md:w-auto flex justify-center">`
);

// 3. Center the Grid (DayPicker)
drawerContent = drawerContent.replace(
    /<DayPicker\s*mode="range"/g,
    `<DayPicker
                                className="mx-auto w-full max-w-[300px] flex justify-center"
                                mode="range"`
);
drawerContent = drawerContent.replace(
    /<DayPicker\s*mode="single"/g,
    `<DayPicker
                                className="mx-auto w-full max-w-[300px] flex justify-center"
                                mode="single"`
);

fs.writeFileSync(drawerPath, drawerContent, 'utf8');
console.log('Successfully updated BookingDrawer.tsx');
