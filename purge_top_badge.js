const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'activity', 'BookingDrawer.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const oldBadge = `{paymentStrategy === 'no_card' && priceUsd !== 0 && <span className="hidden md:inline-flex px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-wider">⚡️ No Card Needed</span>}`;
const newBadge = ``;

content = content.replace(oldBadge, newBadge);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully purged top badge in BookingDrawer.tsx');
