const fs = require('fs');
const path = require('path');

const drawerPath = path.join(__dirname, 'components', 'activity', 'BookingDrawer.tsx');
let drawerContent = fs.readFileSync(drawerPath, 'utf8');

// Fix the duplicated overlay
drawerContent = drawerContent.replace(
    /{\/\* Drawer Overlay \*\/}\s*{\s*isOpen && \(\s*<div\s*{\/\* Drawer Overlay \*\/}\s*{\s*isOpen && \(\s*<div/g,
    `{/* Drawer Overlay */}
      {isOpen && (
        <div`
);

fs.writeFileSync(drawerPath, drawerContent, 'utf8');
console.log('Successfully fixed BookingDrawer.tsx');
