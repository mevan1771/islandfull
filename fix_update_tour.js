const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app', 'actions', 'tours.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Fix missing variables in updateTour
const updateTourRegex = /const price_usd = parseFloat\(formData\.get\("price_usd"\) as string\)\r?\n\s*const price_suffix = formData\.get\("price_suffix"\) as string \|\| ""/;
content = content.replace(updateTourRegex, `const price_usd = parseFloat(formData.get("price_usd") as string)\n    const discount_price_str = formData.get("discount_price") as string\n    const discount_price = discount_price_str ? parseFloat(discount_price_str) : null\n    const deal_end_date = formData.get("deal_end_date") as string || null\n    const price_suffix = formData.get("price_suffix") as string || ""`);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully fixed updateTour in tours.ts');
