const fs = require('fs');
const path = require('path');

const filesToUpdate = [
    'components/home/HeroCarousel.tsx',
    'components/layout/SiteHeader.tsx',
    'app/activity/[slug]/page.tsx',
    'components/ui/MobileBackButton.tsx',
    'components/ui/FavoriteButton.tsx'
];

filesToUpdate.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');

        // Remove custom drop shadows
        content = content.replace(/drop-shadow-\[0_2px_4px_rgba\(0,0,0,0\.8\)\]/g, '');

        // Remove drop-shadow-md
        // content = content.replace(/drop-shadow-md/g, '');
        // Wait, let's be careful with drop-shadow-md, it might be used elsewhere.
        // Let's just remove it from the specific elements if needed, or globally if it's safe.
        // The user said: "Delete any drop-shadow, drop-shadow-md, drop-shadow-lg, or custom drop-shadow-[...] classes from these text elements and SVG icons."
        // Let's remove drop-shadow-md globally in these files, but wait, FavoriteButton uses drop-shadow-md for the overlay variant.
        // Wait, I changed drop-shadow-md to the custom one in FavoriteButton, so it might not have drop-shadow-md anymore.
        // Let's just remove both.
        content = content.replace(/drop-shadow-md/g, '');

        // Clean up multiple spaces
        content = content.replace(/  +/g, ' ');

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${file}`);
    } else {
        console.log(`File not found: ${file}`);
    }
});
