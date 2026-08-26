const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'home', 'HeroCarousel.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');

// Find the index of "const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({})"
const loadedImagesIndex = lines.findIndex(line => line.includes('const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({})'));

// Find the end of carouselSlides
const carouselSlidesEndIndex = lines.findIndex((line, i) => i > loadedImagesIndex && line.includes(']'));

// Insert the currentTour logic after carouselSlides
lines.splice(carouselSlidesEndIndex + 1, 0, '    const currentTour = carouselSlides[currentIndex]', '    const useDarkText = currentTour?.use_dark_text || false');

// Find the static intro slide and add use_dark_text
const staticIntroIndex = lines.findIndex(line => line.includes('isStatic: true'));
lines[staticIntroIndex] = '            isStatic: true,';
lines.splice(staticIntroIndex + 1, 0, '            use_dark_text: introSlide?.use_dark_text || false');

fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log('Successfully updated HeroCarousel');
