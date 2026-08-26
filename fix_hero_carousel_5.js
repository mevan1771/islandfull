const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'home', 'HeroCarousel.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
    '    const currentTour = tours[currentIndex] || introSlide\n    const useDarkText = currentTour?.use_dark_text || false\n\n    const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({})\n\n    // Merge dynamic intro slide with fetched tours\n    const carouselSlides: Tour[] = [\n        {\n            id: \'static-intro\',\n            title: introSlide?.title || \'Your Journey in Sri Lanka Begins Here\',\n            subtitle: introSlide?.subtitle || \'Inspiration, planning, and booking—all in one place.\',\n            slug: \'\',\n            cover_image_url: introSlide?.cover_image_url || \'https://images.unsplash.com/photo-1537519646099-335112f03225?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80\',\n            isStatic: true\n        },\n        ...tours\n    ]',
    '    const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({})\n\n    // Merge dynamic intro slide with fetched tours\n    const carouselSlides: Tour[] = [\n        {\n            id: \'static-intro\',\n            title: introSlide?.title || \'Your Journey in Sri Lanka Begins Here\',\n            subtitle: introSlide?.subtitle || \'Inspiration, planning, and booking—all in one place.\',\n            slug: \'\',\n            cover_image_url: introSlide?.cover_image_url || \'https://images.unsplash.com/photo-1537519646099-335112f03225?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80\',\n            isStatic: true,\n            use_dark_text: introSlide?.use_dark_text || false\n        },\n        ...tours\n    ]\n\n    const currentTour = carouselSlides[currentIndex]\n    const useDarkText = currentTour?.use_dark_text || false'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated HeroCarousel');
