const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const oldMapping = `          priceUsd: d.price_usd,
          price_suffix: d.price_suffix,
          coverImage: d.card_image_url || d.cover_image_url,`;

const newMapping = `          priceUsd: d.price_usd,
          price_suffix: d.price_suffix,
          discount_price: d.discount_price,
          deal_end_date: d.deal_end_date,
          coverImage: d.card_image_url || d.cover_image_url,`;

content = content.replace(oldMapping, newMapping);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated app/page.tsx');
