const fs = require('fs');
const path = require('path');

const drawerPath = path.join(__dirname, 'components', 'activity', 'BookingDrawer.tsx');
let drawerContent = fs.readFileSync(drawerPath, 'utf8');

// 1. Add minGuests to BookingDrawerProps
drawerContent = drawerContent.replace(
    /maxCapacity: number/,
    `maxCapacity: number\n  minGuests?: number`
);

// 2. Destructure minGuests in component props
drawerContent = drawerContent.replace(
    /maxCapacity,/,
    `maxCapacity,\n  minGuests = 1,`
);

// 3. Change initial state of guests
drawerContent = drawerContent.replace(
    /const \[guests, setGuests\] = useState\(1\)/,
    `const [guests, setGuests] = useState(minGuests)`
);

// 4. Update decrement button logic
drawerContent = drawerContent.replace(
    /setGuests\(Math\.max\(1, guests - 1\)\)/,
    `setGuests(Math.max(minGuests, guests - 1))`
);

drawerContent = drawerContent.replace(
    /disabled=\{guests <= 1\}/,
    `disabled={guests <= minGuests}`
);

// 5. Update resetAndClose logic
drawerContent = drawerContent.replace(
    /setGuests\(1\)/,
    `setGuests(minGuests)`
);

fs.writeFileSync(drawerPath, drawerContent, 'utf8');
console.log('Successfully updated BookingDrawer.tsx');
