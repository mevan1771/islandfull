const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'home', 'HeroCarousel.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Update Tour interface
content = content.replace(
    'isStatic?: boolean\n}',
    'isStatic?: boolean\n  use_dark_text?: boolean\n}'
);

// Update h1 class for static slide
content = content.replace(
    'className="text-[clamp(0.75rem,calc(170vw/var(--char-count)),1.5rem)] whitespace-nowrap overflow-hidden text-ellipsis md:text-4xl md:whitespace-normal leading-tight font-bold text-white "',
    'className={`text-[clamp(0.75rem,calc(170vw/var(--char-count)),1.5rem)] whitespace-nowrap overflow-hidden text-ellipsis md:text-4xl md:whitespace-normal leading-tight font-bold ${tour.use_dark_text ? \'text-zinc-900\' : \'text-white\'}`}'
);

// Update h1 class for dynamic slide
content = content.replace(
    'className="text-[clamp(0.75rem,calc(170vw/var(--char-count)),1.5rem)] whitespace-nowrap overflow-hidden text-ellipsis md:text-4xl md:whitespace-normal leading-tight font-bold text-white "',
    'className={`text-[clamp(0.75rem,calc(170vw/var(--char-count)),1.5rem)] whitespace-nowrap overflow-hidden text-ellipsis md:text-4xl md:whitespace-normal leading-tight font-bold ${tour.use_dark_text ? \'text-zinc-900\' : \'text-white\'}`}'
);

// Update subtitle class
content = content.replace(
    'className="block md:block text-sm sm:text-base md:text-lg font-medium text-white/90"',
    'className={`block md:block text-sm sm:text-base md:text-lg font-medium ${tour.use_dark_text ? \'text-zinc-800\' : \'text-white/90\'}`}'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated HeroCarousel');
