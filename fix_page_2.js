const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'app', 'activity', '[slug]', 'page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');

// Update Mobile Minimalist Row
pageContent = pageContent.replace(
    /<span className="text-xs font-semibold text-gray-800">Up to \{activity\.max_capacity\}<\/span>/,
    `<span className="text-xs font-semibold text-gray-800">\n                                {activity.min_guests && activity.min_guests > 1 ? \`\${activity.min_guests} - \${activity.max_capacity} Guests\` : \`Up to \${activity.max_capacity}\`}\n                            </span>`
);

// Update Desktop Balloons
pageContent = pageContent.replace(
    /<span className="text-base font-semibold text-slate-700\/80">Up to \{activity\.max_capacity\}<\/span>/,
    `<span className="text-base font-semibold text-slate-700/80">\n                                    {activity.min_guests && activity.min_guests > 1 ? \`\${activity.min_guests} - \${activity.max_capacity} Guests\` : \`Up to \${activity.max_capacity}\`}\n                                </span>`
);

fs.writeFileSync(pagePath, pageContent, 'utf8');
console.log('Successfully updated activity page.tsx');
