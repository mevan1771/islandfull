const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'home', 'HeroCarousel.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update transition classes
content = content.replace(
    `? 'opacity-100 z-20 transition-opacity duration-[1200ms]'`,
    `? 'opacity-100 z-20 transition-opacity duration-700'`
);

content = content.replace(
    `: 'opacity-0 z-10 pointer-events-none transition-opacity duration-[1200ms] delay-[1200ms]'`,
    `: 'opacity-0 z-10 pointer-events-none transition-opacity duration-700 delay-700'`
);

// 2. Update loading attribute to eager load index 1
content = content.replace(
    `loading={index === 0 ? "eager" : "lazy"}`,
    `loading={index <= 1 ? "eager" : "lazy"}`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated HeroCarousel.tsx');
