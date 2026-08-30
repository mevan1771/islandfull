const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'app', 'activity', '[slug]', 'page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');

// 1. Add import
pageContent = pageContent.replace(
    /import \{ ActivityGallery \} from "@\/components\/activity\/ActivityGallery"/,
    `import { ActivityGallery } from "@/components/activity/ActivityGallery"\nimport { FaqAccordion } from "@/components/activity/FaqAccordion"`
);

// 2. Replace FAQs block
const oldFaqRegex = /\{\/\* FAQs \*\/\}\n                    \{activity\.faqs && activity\.faqs\.length > 0 && \([\s\S]*?<\/section>\n                    \}\)/;

pageContent = pageContent.replace(
    oldFaqRegex,
    `{/* FAQs */}\n                    <FaqAccordion faqs={activity.faqs} />`
);

fs.writeFileSync(pagePath, pageContent, 'utf8');
console.log('Successfully updated activity page.tsx');
