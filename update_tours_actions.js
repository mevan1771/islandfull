const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app', 'actions', 'tours.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Add to createTour extraction
content = content.replace(
    `const price_usd = parseFloat(formData.get("price_usd") as string)`,
    `const price_usd = parseFloat(formData.get("price_usd") as string)\n    const discount_price_str = formData.get("discount_price") as string\n    const discount_price = discount_price_str ? parseFloat(discount_price_str) : null\n    const deal_end_date = formData.get("deal_end_date") as string || null`
);

// Add to createTour insert object
content = content.replace(
    `price_usd,`,
    `price_usd,\n        discount_price,\n        deal_end_date,`
);

// Add to updateTour extraction
content = content.replace(
    `const price_usd = parseFloat(formData.get("price_usd") as string)`,
    `const price_usd = parseFloat(formData.get("price_usd") as string)\n    const discount_price_str = formData.get("discount_price") as string\n    const discount_price = discount_price_str ? parseFloat(discount_price_str) : null\n    const deal_end_date = formData.get("deal_end_date") as string || null`
);

// Add to updateTour update object
content = content.replace(
    `price_usd,`,
    `price_usd,\n        discount_price,\n        deal_end_date,`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated tours.ts');
