const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'home', 'HeroCarousel.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Use regex to match the Image component to avoid whitespace issues
const imageRegex = /<Image[\s\S]*?src=\{upgradeUnsplashUrl\(tour\.cover_image_url \|\| tour\.card_image_url \|\| ""\)\}[\s\S]*?alt=\{tour\.title\}[\s\S]*?fill[\s\S]*?className=\{`object-cover transition-opacity duration-700 ease-in-out \$\{index === 0 \|\| loadedImages\[tour\.id\] \? 'opacity-100' : 'opacity-0'\}`\}[\s\S]*?onLoad=\{[\s\S]*?\}[\s\S]*?priority=\{true\}[\s\S]*?fetchPriority=\{index === 0 \? "high" : "auto"\}[\s\S]*?quality=\{95\}[\s\S]*?sizes="100vw"[\s\S]*?unoptimized=\{true\}[\s\S]*?\/>/;

const newImage = `<Image
                        src={upgradeUnsplashUrl(tour.cover_image_url || tour.card_image_url || "")}
                        alt={tour.title}
                        fill
                        className={\`object-cover transition-opacity duration-700 ease-in-out \${index === 0 || loadedImages[tour.id] ? 'opacity-100' : 'opacity-0'}\`}
                        onLoad={() => setLoadedImages(prev => ({ ...prev, [tour.id]: true }))}
                        priority={index === 0}
                        fetchPriority={index === 0 ? "high" : "auto"}
                        quality={95}
                        sizes="100vw"
                    />`;

if (imageRegex.test(content)) {
    content = content.replace(imageRegex, newImage);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully updated HeroCarousel.tsx');
} else {
    console.log('Regex did not match. Trying manual replacement...');
    // Let's just replace the specific lines
    content = content.replace(/priority=\{true\}/g, 'priority={index === 0}');
    content = content.replace(/unoptimized=\{true\}/g, '');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully updated HeroCarousel.tsx manually');
}
