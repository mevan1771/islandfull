const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app', 'actions', 'tours.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Fix duplicate in createTour insert object
content = content.replace(
    `        discount_price,\n        deal_end_date,\n        discount_price,\n        deal_end_date,`,
    `        discount_price,\n        deal_end_date,`
);

// Add to updateTour update object
const updateTourRegex = /Price: price_usd,\n\s*Category: category_type,/;
content = content.replace(updateTourRegex, `Price: price_usd,\n        discount_price,\n        deal_end_date,\n        Category: category_type,`);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully fixed tours.ts insert/update objects');
