const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'app', 'activity', '[slug]', 'page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');

// 1. Add import if missing
if (!pageContent.includes('import { FaqAccordion }')) {
    pageContent = pageContent.replace(
        /import \{ ActivityGallery \} from "@\/components\/activity\/ActivityGallery"/,
        `import { ActivityGallery } from "@/components/activity/ActivityGallery"\nimport { FaqAccordion } from "@/components/activity/FaqAccordion"`
    );
}

// 2. Replace FAQs block
const oldFaqStart = `{/* FAQs */}`;
const oldFaqEnd = `                    {/* Photo Gallery */}`;

const startIndex = pageContent.indexOf(oldFaqStart);
const endIndex = pageContent.indexOf(oldFaqEnd);

if (startIndex !== -1 && endIndex !== -1) {
    const before = pageContent.substring(0, startIndex);
    const after = pageContent.substring(endIndex);

    pageContent = before + `{/* FAQs */}\n                    <FaqAccordion faqs={activity.faqs} />\n\n` + after;

    fs.writeFileSync(pagePath, pageContent, 'utf8');
    console.log('Successfully updated activity page.tsx');
} else {
    console.log('Could not find FAQs block boundaries.');
}
