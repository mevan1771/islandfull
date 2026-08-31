const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app', 'activity', '[slug]', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Pass discountPrice and dealEndDate to BookingDrawer
content = content.replace(
    `cancellationTierData={cancellationTierData}`,
    `cancellationTierData={cancellationTierData}\n        discountPrice={activity.discount_price}\n        dealEndDate={activity.deal_end_date}`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated page.tsx');
