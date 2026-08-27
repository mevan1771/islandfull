const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app', 'activity', '[slug]', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Import GlobalHeader
if (!content.includes('import { GlobalHeader }')) {
    content = content.replace(
        'import { HeaderThemeSetter } from "@/components/layout/HeaderThemeSetter"',
        'import { HeaderThemeSetter } from "@/components/layout/HeaderThemeSetter"\nimport { GlobalHeader } from "@/components/layout/GlobalHeader"'
    );
}

// Inject GlobalHeader
content = content.replace(
    '<div className="bg-white min-h-screen pb-32 md:pb-12">',
    '<div className="bg-white min-h-screen pb-32 md:pb-12">\n            <GlobalHeader />'
);

// Remove MobileBackButton
content = content.replace(
    /\{\/\* Mobile Back Button \*\/\}\s*<div className="absolute top-4 left-4 z-50 md:hidden">\s*<MobileBackButton useDarkTextMobile=\{activity\.use_dark_text_mobile\} \/>\s*<\/div>/g,
    ''
);

// Remove FavoriteButton
content = content.replace(
    /<FavoriteButton activityId=\{activity\.id\} className="hidden md:flex" useDarkTextDesktop=\{activity\.use_dark_text_desktop\} useDarkTextMobile=\{activity\.use_dark_text_mobile\} \/>/g,
    ''
);

// Remove HeaderThemeSetter since we have a solid white header now
content = content.replace(
    /<HeaderThemeSetter useDarkTextDesktop=\{activity\.use_dark_text_desktop\} useDarkTextMobile=\{activity\.use_dark_text_mobile\} \/>/g,
    ''
);

// Adjust cover image margin to account for the header
content = content.replace(
    '<div className="relative h-[35svh] md:h-[600px] m-3 sm:m-0 md:mx-auto md:w-full md:mt-6 max-w-[1400px] rounded-2xl sm:rounded-3xl overflow-hidden">',
    '<div className="relative h-[35svh] md:h-[600px] m-3 sm:m-0 md:mx-auto md:w-full max-w-[1400px] rounded-2xl sm:rounded-3xl overflow-hidden">'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated Activity Page');
