const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'home', 'HeroCarousel.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Update Tour interface
content = content.replace(
    'use_dark_text?: boolean',
    'use_dark_text_desktop?: boolean\n    use_dark_text_mobile?: boolean'
);

// Update carouselSlides static intro
content = content.replace(
    'use_dark_text: introSlide?.use_dark_text || false',
    'use_dark_text_desktop: introSlide?.use_dark_text_desktop || false,\n            use_dark_text_mobile: introSlide?.use_dark_text_mobile || false'
);

// Update currentTour logic
content = content.replace(
    'const useDarkText = currentTour?.use_dark_text || false',
    'const useDarkTextDesktop = currentTour?.use_dark_text_desktop || false\n    const useDarkTextMobile = currentTour?.use_dark_text_mobile || false'
);

// Update HeaderThemeSetter
content = content.replace(
    '<HeaderThemeSetter useDarkText={useDarkText} />',
    '<HeaderThemeSetter useDarkTextDesktop={useDarkTextDesktop} useDarkTextMobile={useDarkTextMobile} />'
);

// Update static slide title class
content = content.replace(
    'className={`text-[clamp(0.75rem,calc(170vw/var(--char-count)),1.5rem)] whitespace-nowrap overflow-hidden text-ellipsis md:text-4xl md:whitespace-normal leading-tight font-bold ${tour.use_dark_text ? \'text-slate-700/80\' : \'text-white\'}`}',
    'className={`text-[clamp(0.75rem,calc(170vw/var(--char-count)),1.5rem)] whitespace-nowrap overflow-hidden text-ellipsis md:text-4xl md:whitespace-normal leading-tight font-bold ${tour.use_dark_text_mobile ? \'text-slate-700/80\' : \'text-white\'} ${tour.use_dark_text_desktop ? \'md:text-slate-700/80\' : \'md:text-white\'}`}'
);

// Update static slide subtitle class
content = content.replace(
    'className={`block md:block text-sm sm:text-base md:text-lg font-medium ${tour.use_dark_text ? \'text-slate-600/80\' : \'text-white/90\'}`}',
    'className={`block md:block text-sm sm:text-base md:text-lg font-medium ${tour.use_dark_text_mobile ? \'text-slate-600/80\' : \'text-white/90\'} ${tour.use_dark_text_desktop ? \'md:text-slate-600/80\' : \'md:text-white/90\'}`}'
);

// Update dynamic slide title class
content = content.replace(
    'className={`text-[clamp(0.75rem,calc(170vw/var(--char-count)),1.5rem)] whitespace-nowrap overflow-hidden text-ellipsis md:text-4xl md:whitespace-normal leading-tight font-bold ${tour.use_dark_text ? \'text-slate-700/80\' : \'text-white\'}`}',
    'className={`text-[clamp(0.75rem,calc(170vw/var(--char-count)),1.5rem)] whitespace-nowrap overflow-hidden text-ellipsis md:text-4xl md:whitespace-normal leading-tight font-bold ${tour.use_dark_text_mobile ? \'text-slate-700/80\' : \'text-white\'} ${tour.use_dark_text_desktop ? \'md:text-slate-700/80\' : \'md:text-white\'}`}'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated HeroCarousel');
