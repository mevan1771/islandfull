const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'home', 'HeroCarousel.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const oldImage = `<Image
                        src={upgradeUnsplashUrl(tour.cover_image_url || tour.card_image_url || "")}
                        alt={tour.title}
                        fill
                        className={\`object-cover transition-opacity duration-700 ease-in-out \${index === 0 || loadedImages[tour.id] ? 'opacity-100' : 'opacity-0'}\`}
                        onLoad={() => setLoadedImages(prev => ({ ...prev, [tour.id]: true }))}
                        priority={true}
                        fetchPriority={index === 0 ? "high" : "auto"}
                        quality={95}
                        sizes="100vw"
                        unoptimized={true}
                    />`;

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

content = content.replace(oldImage, newImage);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated HeroCarousel.tsx');
