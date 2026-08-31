const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'activity', 'BookingDrawer.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Fix interface
content = content.replace(
    /cancellationTierData\?: CancellationTierData \| null\r?\n\}/,
    `cancellationTierData?: CancellationTierData | null\n  discountPrice?: number | null\n  dealEndDate?: string | null\n}`
);

// Fix component props
content = content.replace(
    /hostName,\r?\n\s*cancellationTierData\r?\n\}: BookingDrawerProps\) \{/,
    `hostName,\n  cancellationTierData,\n  discountPrice,\n  dealEndDate\n}: BookingDrawerProps) {`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully fixed BookingDrawer.tsx');
