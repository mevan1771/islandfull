const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app', 'actions', 'tours.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Replace in createTour and updateTour
content = content.replace(
    'const use_dark_text = formData.get("use_dark_text") === "true"',
    'const use_dark_text_desktop = formData.get("use_dark_text_desktop") === "true"\n    const use_dark_text_mobile = formData.get("use_dark_text_mobile") === "true"'
);

content = content.replace(
    'const use_dark_text = formData.get("use_dark_text") === "true"',
    'const use_dark_text_desktop = formData.get("use_dark_text_desktop") === "true"\n    const use_dark_text_mobile = formData.get("use_dark_text_mobile") === "true"'
);

content = content.replace(
    'use_dark_text,',
    'use_dark_text_desktop,\n      use_dark_text_mobile,'
);

content = content.replace(
    'use_dark_text,',
    'use_dark_text_desktop,\n      use_dark_text_mobile,'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated tours.ts');
