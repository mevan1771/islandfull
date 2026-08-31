const fs = require('fs');
const path = require('path');

// 1. Update ActivityGrid.tsx
const gridPath = path.join(__dirname, 'components', 'home', 'ActivityGrid.tsx');
let gridContent = fs.readFileSync(gridPath, 'utf8');

gridContent = gridContent.replace(
    `priceSuffix={activity.price_suffix}`,
    `priceSuffix={activity.price_suffix}\n          discountPrice={activity.discount_price}\n          dealEndDate={activity.deal_end_date}`
);

fs.writeFileSync(gridPath, gridContent, 'utf8');
console.log('Successfully updated ActivityGrid.tsx');

// 2. Update app/activity/[slug]/page.tsx
const pagePath = path.join(__dirname, 'app', 'activity', '[slug]', 'page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');

pageContent = pageContent.replace(
    `priceSuffix={related.price_suffix}`,
    `priceSuffix={related.price_suffix}\n                                        discountPrice={related.discount_price}\n                                        dealEndDate={related.deal_end_date}`
);

fs.writeFileSync(pagePath, pageContent, 'utf8');
console.log('Successfully updated page.tsx');
