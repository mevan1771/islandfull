const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'activity', 'BookingDrawer.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
  'className="bg-rose-50 p-3 rounded-xl border border-rose-100 mt-4 flex items-start gap-2"',
  'className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 mt-4 flex items-start gap-2"'
);

content = content.replace(
  'className="w-4 h-4 text-rose-500 mt-0.5 shrink-0"',
  'className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0"'
);

content = content.replace(
  'className="text-xs font-medium text-rose-700"',
  'className="text-xs font-medium text-emerald-700"'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated BookingDrawer.tsx');
