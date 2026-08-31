const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app', 'actions', 'tours.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Fix updateData in updateTour
const updateDataRegex = /price_usd,\r?\n\s*price_suffix,/;
content = content.replace(updateDataRegex, `price_usd,\n      discount_price,\n      deal_end_date,\n      price_suffix,`);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully fixed updateData in tours.ts');
