const fs = require('fs');
const path = require('path');

const filesToUpdate = [
    'components/home/HeroCarousel.tsx',
    'components/home/SpotlightCarousel.tsx',
    'app/activity/[slug]/page.tsx',
    'components/ui/MobileBackButton.tsx',
    'components/ui/FavoriteButton.tsx'
];

filesToUpdate.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');

        // Replace text-zinc-900 with text-slate-700/80 for main titles
        content = content.replace(/text-zinc-900/g, 'text-slate-700/80');

        // Replace text-zinc-800 with text-slate-600/80 for subtitles
        content = content.replace(/text-zinc-800/g, 'text-slate-600/80');

        // Replace text-zinc-600 with text-slate-600/80 for smaller text
        content = content.replace(/text-zinc-600/g, 'text-slate-600/80');

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${file}`);
    } else {
        console.log(`File not found: ${file}`);
    }
});
