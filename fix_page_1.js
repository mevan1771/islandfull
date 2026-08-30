const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'app', 'activity', '[slug]', 'page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');

// Add minGuests to both BookingDrawer instances
pageContent = pageContent.replace(
    /maxCapacity=\{activity\.max_capacity\}/g,
    `maxCapacity={activity.max_capacity}\n                            minGuests={activity.min_guests}`
);

fs.writeFileSync(pagePath, pageContent, 'utf8');
console.log('Successfully updated activity page.tsx');
