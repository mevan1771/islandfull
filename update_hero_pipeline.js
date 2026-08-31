const fs = require('fs');
const path = require('path');

// 1. Update app/page.tsx
const pagePath = path.join(__dirname, 'app', 'page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');

const carouselSlidesLogic = `
  const carouselSlides = [
    {
      id: 'static-intro',
      title: introSlide?.title ?? 'Your Journey in Sri Lanka Begins Here',
      subtitle: introSlide?.subtitle ?? 'Inspiration, planning, and booking—all in one place.',
      slug: '',
      cover_image_url: introSlide?.cover_image_url || 'https://images.unsplash.com/photo-1537519646099-335112f03225?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80',
      isStatic: true,
      use_dark_text_desktop: introSlide?.use_dark_text_desktop || introSlide?.useDarkText || false,
      use_dark_text_mobile: introSlide?.use_dark_text_mobile || introSlide?.useDarkText || false
    },
    ...featuredTours
  ];

  return (
    <div className="pb-24">
      {/* Hero Section */}
      <HeroCarousel carouselSlides={carouselSlides} />`;

pageContent = pageContent.replace(
    /return \(\s*<div className="pb-24">\s*\{\/\* Hero Section \*\/\}\s*<HeroCarousel tours=\{featuredTours\} introSlide=\{introSlide\} \/>/,
    carouselSlidesLogic
);

fs.writeFileSync(pagePath, pageContent, 'utf8');
console.log('Successfully updated app/page.tsx');

// 2. Update HeroCarousel.tsx
const heroPath = path.join(__dirname, 'components', 'home', 'HeroCarousel.tsx');
let heroContent = fs.readFileSync(heroPath, 'utf8');

// Export Tour interface
heroContent = heroContent.replace(
    `interface Tour {`,
    `export interface Tour {`
);

// Update props
heroContent = heroContent.replace(
    `export function HeroCarousel({ tours, introSlide }: { tours: Tour[], introSlide?: any }) {`,
    `export function HeroCarousel({ carouselSlides }: { carouselSlides: Tour[] }) {`
);

// Remove internal merge logic
const internalMergeRegex = /\s*\/\/ Merge dynamic intro slide with fetched tours\s*const carouselSlides: Tour\[\] = \[\s*\{\s*id: 'static-intro',[\s\S]*?\},?\s*\.\.\.tours\s*\]\s*/;
heroContent = heroContent.replace(internalMergeRegex, '\n');

fs.writeFileSync(heroPath, heroContent, 'utf8');
console.log('Successfully updated HeroCarousel.tsx');
