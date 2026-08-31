const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'activity', 'ActivityCard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix interface
content = content.replace(
    /priceSuffix\?: string\r?\n\}/,
    `priceSuffix?: string\n  discountPrice?: number | null\n  dealEndDate?: string | null\n}`
);

// Fix component props
content = content.replace(
    /priceSuffix,\r?\n\}: ActivityCardProps\) \{/,
    `priceSuffix,\n  discountPrice,\n  dealEndDate,\n}: ActivityCardProps) {`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully fixed ActivityCard.tsx');
