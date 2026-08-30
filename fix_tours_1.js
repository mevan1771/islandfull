const fs = require('fs');
const path = require('path');

const actionsPath = path.join(__dirname, 'app', 'actions', 'tours.ts');
let actionsContent = fs.readFileSync(actionsPath, 'utf8');

// 1. Update createTour
actionsContent = actionsContent.replace(
    /const max_capacity = parseInt\(formData\.get\("max_capacity"\) as string, 10\)/,
    `const max_capacity = parseInt(formData.get("max_capacity") as string, 10)\n    const min_guests = parseInt(formData.get("min_guests") as string || "1", 10)`
);

actionsContent = actionsContent.replace(
    /max_capacity,\s*pricing_tiers,/,
    `max_capacity,\n      min_guests,\n      pricing_tiers,`
);

// 2. Update updateTour
actionsContent = actionsContent.replace(
    /const max_capacity = parseInt\(formData\.get\("max_capacity"\) as string, 10\)/,
    `const max_capacity = parseInt(formData.get("max_capacity") as string, 10)\n    const min_guests = parseInt(formData.get("min_guests") as string || "1", 10)`
);

actionsContent = actionsContent.replace(
    /max_capacity,\s*pricing_tiers,/,
    `max_capacity,\n      min_guests,\n      pricing_tiers,`
);

fs.writeFileSync(actionsPath, actionsContent, 'utf8');
console.log('Successfully updated tours.ts');
