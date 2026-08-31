const fs = require('fs');
const path = require('path');

// 1. Update page.tsx
const pagePath = path.join(__dirname, 'app', 'activity', '[slug]', 'page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');

// Add import for MobilePaddingSetter
if (!pageContent.includes('MobilePaddingSetter')) {
    pageContent = pageContent.replace(
        `import { MobileBackButton } from "@/components/ui/MobileBackButton"`,
        `import { MobileBackButton } from "@/components/ui/MobileBackButton"\nimport { MobilePaddingSetter } from "@/components/activity/MobilePaddingSetter"`
    );
}

// Remove pb-32 from the main wrapper
pageContent = pageContent.replace(
    `<div className="bg-white min-h-screen pb-32 md:pb-12">`,
    `<div className="bg-white min-h-screen md:pb-12">\n            <MobilePaddingSetter />`
);

// Ensure desktop container is hidden lg:block (user requested)
pageContent = pageContent.replace(
    `<div className="hidden md:block w-full max-w-[420px]">`,
    `<div className="hidden lg:block w-full max-w-[420px]">`
);

// Ensure mobile container is lg:hidden
pageContent = pageContent.replace(
    `<div className="md:hidden">`,
    `<div className="lg:hidden">`
);

fs.writeFileSync(pagePath, pageContent, 'utf8');
console.log('Successfully updated page.tsx');

// 2. Update globals.css
const cssPath = path.join(__dirname, 'app', 'globals.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');

if (!cssContent.includes('.mobile-booking-padding')) {
    cssContent += `\n\n@media (max-width: 1023px) {\n  body.mobile-booking-padding {\n    padding-bottom: 120px !important;\n  }\n}\n`;
    fs.writeFileSync(cssPath, cssContent, 'utf8');
    console.log('Successfully updated globals.css');
}

// 3. Update BookingDrawer.tsx to use lg: instead of md:
const drawerPath = path.join(__dirname, 'components', 'activity', 'BookingDrawer.tsx');
let drawerContent = fs.readFileSync(drawerPath, 'utf8');

drawerContent = drawerContent.replace(
    `<div className="hidden md:block w-full bg-white rounded-2xl border border-zinc-200 shadow-xl overflow-hidden sticky top-28">`,
    `<div className="hidden lg:block w-full bg-white rounded-2xl border border-zinc-200 shadow-xl overflow-hidden sticky top-28">`
);

drawerContent = drawerContent.replace(
    `<div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 p-4 pb-safe z-50 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">`,
    `<div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 p-4 pb-safe z-50 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">`
);

fs.writeFileSync(drawerPath, drawerContent, 'utf8');
console.log('Successfully updated BookingDrawer.tsx');
