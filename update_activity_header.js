const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app', 'activity', '[slug]', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Add import
if (!content.includes('HeaderThemeSetter')) {
    content = content.replace(
        'import Image from "next/image"',
        'import Image from "next/image"\nimport { HeaderThemeSetter } from "@/components/layout/HeaderThemeSetter"'
    );
}

// Add component
content = content.replace(
    '<div className="bg-white min-h-screen pb-32 md:pb-12">',
    '<div className="bg-white min-h-screen pb-32 md:pb-12">\n      <HeaderThemeSetter useDarkText={activity.use_dark_text} />'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated Activity Page');
