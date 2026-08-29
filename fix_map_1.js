const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'app', 'map', 'page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');

// Update select query
pageContent = pageContent.replace(
    /\.select\('id, title, slug, location, description, inclusions, provider_name, price_usd, cover_image_url, duration, category_type, categories\(name, slug\), activity_categories\(categories\(slug\)\), reviews\(rating\)'\)/g,
    `.select('id, title, slug, location, description, inclusions, provider_name, price_usd, cover_image_url, duration, category_type, approx_lat, approx_lng, categories(name, slug), activity_categories(categories(slug)), reviews(rating)')`
);

// Update mapping
pageContent = pageContent.replace(
    /latitude: null, \/\/ Relies on location string fallback lookup\s*longitude: null,/g,
    `latitude: activity.approx_lat ? parseFloat(activity.approx_lat) : null,
        longitude: activity.approx_lng ? parseFloat(activity.approx_lng) : null,`
);

fs.writeFileSync(pagePath, pageContent, 'utf8');
console.log('Successfully updated page.tsx');
