const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'home', 'HeroCarousel.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Add import
if (!content.includes('HeaderThemeSetter')) {
    content = content.replace(
        'import Link from "next/link"',
        'import Link from "next/link"\nimport { HeaderThemeSetter } from "@/components/layout/HeaderThemeSetter"'
    );
}

// Add HeaderThemeSetter
content = content.replace(
    'const [currentIndex, setCurrentIndex] = useState(0)',
    'const [currentIndex, setCurrentIndex] = useState(0)\n\n    const currentTour = tours[currentIndex] || introSlide\n    const useDarkText = currentTour?.use_dark_text || false'
);

content = content.replace(
    '<section className="relative pt-24 md:pt-32 pb-40 md:pb-48 text-white min-h-[50svh] md:min-h-[85vh] flex flex-col justify-center overflow-hidden rounded-b-xl md:rounded-none bg-zinc-100 animate-in fade-in duration-700 ease-in-out">',
    '<section className="relative pt-24 md:pt-32 pb-40 md:pb-48 text-white min-h-[50svh] md:min-h-[85vh] flex flex-col justify-center overflow-hidden rounded-b-xl md:rounded-none bg-zinc-100 animate-in fade-in duration-700 ease-in-out">\n            <HeaderThemeSetter useDarkText={useDarkText} />'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated HeroCarousel');
