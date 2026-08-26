const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'home', 'HeroCarousel.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
    '// Move currentTour logic down after carouselSlides is defined',
    ''
);

content = content.replace(
    'isStatic: true\n        },',
    'isStatic: true,\n            use_dark_text: introSlide?.use_dark_text || false\n        },'
);

content = content.replace(
    '...tours\n    ]',
    '...tours\n    ]\n\n    const currentTour = carouselSlides[currentIndex]\n    const useDarkText = currentTour?.use_dark_text || false'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated HeroCarousel');
