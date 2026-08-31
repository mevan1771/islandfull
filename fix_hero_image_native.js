const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'home', 'HeroCarousel.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace the Next.js Image component with a native img tag
const imageRegex = /<Image[\s\S]*?src=\{upgradeUnsplashUrl\(tour\.cover_image_url \|\| tour\.card_image_url \|\| ""\)\}[\s\S]*?alt=\{tour\.title\}[\s\S]*?fill[\s\S]*?className=\{`object-cover transition-opacity duration-700 ease-in-out \$\{index === 0 \|\| loadedImages\[tour\.id\] \? 'opacity-100' : 'opacity-0'\}`\}[\s\S]*?onLoad=\{[\s\S]*?\}[\s\S]*?priority=\{index === 0\}[\s\S]*?fetchPriority=\{index === 0 \? "high" : "auto"\}[\s\S]*?quality=\{95\}[\s\S]*?sizes="100vw"[\s\S]*?\/>/;

const nativeImg = `<img
                        src={upgradeUnsplashUrl(tour.cover_image_url || tour.card_image_url || "")}
                        alt={tour.title}
                        className={\`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out \${index === 0 || loadedImages[tour.id] ? 'opacity-100' : 'opacity-0'}\`}
                        onLoad={() => setLoadedImages(prev => ({ ...prev, [tour.id]: true }))}
                        fetchPriority={index === 0 ? "high" : "auto"}
                        decoding={index === 0 ? "sync" : "async"}
                        loading={index === 0 ? "eager" : "lazy"}
                    />`;

if (imageRegex.test(content)) {
    content = content.replace(imageRegex, nativeImg);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully updated HeroCarousel.tsx');
} else {
    console.log('Regex did not match. Trying manual replacement...');
    // Let's just replace the specific lines
    const manualRegex = /<Image\s+src=\{upgradeUnsplashUrl\(tour\.cover_image_url \|\| tour\.card_image_url \|\| ""\)\}\s+alt=\{tour\.title\}\s+fill\s+className=\{`object-cover transition-opacity duration-700 ease-in-out \$\{index === 0 \|\| loadedImages\[tour\.id\] \? 'opacity-100' : 'opacity-0'\}`\}\s+onLoad=\{\(\) => setLoadedImages\(prev => \(\{ \.\.\.prev, \[tour\.id\]: true \}\)\)\}\s+priority=\{index === 0\}\s+fetchPriority=\{index === 0 \? "high" : "auto"\}\s+quality=\{95\}\s+sizes="100vw"\s+\/>/g;

    if (manualRegex.test(content)) {
        content = content.replace(manualRegex, nativeImg);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Successfully updated HeroCarousel.tsx manually');
    } else {
        console.log('Manual regex also failed. Dumping content around <Image');
        const idx = content.indexOf('<Image');
        console.log(content.substring(idx, idx + 500));
    }
}
