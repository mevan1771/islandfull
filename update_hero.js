const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'home', 'HeroCarousel.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Remove the overlay
content = content.replace(
    '{/* Slide-specific Legibility Mask */}\n          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none z-10"></div>',
    ''
);

// Add text shadows to title
content = content.replace(
    /drop-shadow-md/g,
    'drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated HeroCarousel.tsx');
