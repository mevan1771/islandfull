const fs = require('fs');
const path = require('path');

// 1. Fix Activity Page Hero Z-Index
const pagePath = path.join(__dirname, 'app', 'activity', '[slug]', 'page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');
pageContent = pageContent.replace(
    /className="absolute bottom-0 left-0 right-0 w-full pb-4 md:pb-8 z-10"/g,
    `className="absolute bottom-0 left-0 right-0 w-full pb-4 md:pb-8"`
);
fs.writeFileSync(pagePath, pageContent, 'utf8');
console.log('Successfully updated page.tsx');

// 2. Portal Booking Drawer
const drawerPath = path.join(__dirname, 'components', 'activity', 'BookingDrawer.tsx');
let drawerContent = fs.readFileSync(drawerPath, 'utf8');

// Add imports
drawerContent = drawerContent.replace(
    /import { useState } from "react"/g,
    `import { useState, useEffect } from "react"\nimport { createPortal } from "react-dom"`
);

// Add mounted state
drawerContent = drawerContent.replace(
    /export function BookingDrawer\(\{\s*activityId,\s*title,\s*priceUsd,\s*priceLkrApprox,\s*maxCapacity,\s*pricingTiers,\s*tourOptions,\s*paymentStrategy,\s*hasPickup,\s*blackoutDates,\s*isHiddenGem,\s*rating,\s*reviewCount,\s*minNoticeDays,\s*bookingType,\s*pricingModel,\s*hostAvatar,\s*hostName,\s*cancellationTierData\s*}: BookingDrawerProps\) {/g,
    `export function BookingDrawer({
  activityId,
  title,
  priceUsd,
  priceLkrApprox,
  maxCapacity,
  pricingTiers,
  tourOptions,
  paymentStrategy,
  hasPickup,
  blackoutDates,
  isHiddenGem,
  rating,
  reviewCount,
  minNoticeDays,
  bookingType,
  pricingModel,
  hostAvatar,
  hostName,
  cancellationTierData
}: BookingDrawerProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])`
);

// Add pointer-events-auto to overlay
drawerContent = drawerContent.replace(
    /className="fixed inset-0 bg-zinc-900\/60 backdrop-blur-sm z-\[99999\] transition-opacity"/g,
    `className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-[99999] transition-opacity pointer-events-auto"`
);

// Wrap modal in createPortal
drawerContent = drawerContent.replace(
    /{\/\* Drawer Overlay \*\/}/g,
    `{mounted && createPortal(
        <>
          {/* Drawer Overlay */}`
);

// Close createPortal at the end of the file
drawerContent = drawerContent.replace(
    /<\/div>\s*<\/>\s*\)\s*}\s*$/g,
    `</div>
        </>,
        document.body
      )}
    </>
  )
}
`
);

fs.writeFileSync(drawerPath, drawerContent, 'utf8');
console.log('Successfully updated BookingDrawer.tsx');
