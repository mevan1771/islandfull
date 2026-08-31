const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'home', 'HeroCarousel.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Replace || with ?? for title and subtitle
content = content.replace(
    `title: introSlide?.title || 'Your Journey in Sri Lanka Begins Here',`,
    `title: introSlide?.title ?? 'Your Journey in Sri Lanka Begins Here',`
);

content = content.replace(
    `subtitle: introSlide?.subtitle || 'Inspiration, planning, and booking—all in one place.',`,
    `subtitle: introSlide?.subtitle ?? 'Inspiration, planning, and booking—all in one place.',`
);

// 2. Conditionally render title (Static Slide)
const staticTitleRegex = /<h1[\s\S]*?className=\{`text-\[clamp\(0\.75rem,calc\(170vw\/var\(--char-count\)\),1\.5rem\)\] whitespace-nowrap overflow-hidden text-ellipsis md:text-4xl md:whitespace-normal leading-tight font-bold \$\{tour\.use_dark_text_mobile \? 'text-slate-700\/80' : 'text-white'\} \$\{tour\.use_dark_text_desktop \? 'md:text-slate-700\/80' : 'md:text-white'\}`\}[\s\S]*?style=\{\{ '--char-count': tour\.title\.length \} as React\.CSSProperties\}[\s\S]*?>[\s\S]*?\{tour\.title\}[\s\S]*?<\/h1>/;

const staticTitleReplacement = `{tour.title ? (
                                                <h1
                                                    className={\`text-[clamp(0.75rem,calc(170vw/var(--char-count)),1.5rem)] whitespace-nowrap overflow-hidden text-ellipsis md:text-4xl md:whitespace-normal leading-tight font-bold \${tour.use_dark_text_mobile ? 'text-slate-700/80' : 'text-white'} \${tour.use_dark_text_desktop ? 'md:text-slate-700/80' : 'md:text-white'}\`}
                                                    style={{ '--char-count': tour.title.length } as React.CSSProperties}
                                                >
                                                    {tour.title}
                                                </h1>
                                            ) : null}`;

// We need to replace it twice (once for static, once for dynamic)
content = content.replace(staticTitleRegex, staticTitleReplacement);
content = content.replace(staticTitleRegex, staticTitleReplacement);

// 3. Conditionally render subtitle (already has {tour.subtitle && ...} but let's make sure it handles empty string correctly)
// {tour.subtitle && ( ... )} will render nothing if tour.subtitle is "", which is correct.
// Let's check if it's already there.
// Yes, it is: {tour.subtitle && ( <p ...> {tour.subtitle} </p> )}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated HeroCarousel.tsx');
