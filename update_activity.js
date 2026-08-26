const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app', 'activity', '[slug]', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Update MobileBackButton
content = content.replace(
    '<MobileBackButton />',
    '<MobileBackButton useDarkText={activity.use_dark_text} />'
);

// Update FavoriteButton
content = content.replace(
    '<FavoriteButton activityId={activity.id} className="hidden md:flex" />',
    '<FavoriteButton activityId={activity.id} className="hidden md:flex" useDarkText={activity.use_dark_text} />'
);

// Update h1 class
content = content.replace(
    'className="text-[clamp(0.875rem,calc(120vw/var(--char-count)),1.25rem)] whitespace-nowrap overflow-hidden text-ellipsis md:text-4xl md:leading-tight md:whitespace-normal md:overflow-visible font-bold tracking-tight text-white "',
    'className={`text-[clamp(0.875rem,calc(120vw/var(--char-count)),1.25rem)] whitespace-nowrap overflow-hidden text-ellipsis md:text-4xl md:leading-tight md:whitespace-normal md:overflow-visible font-bold tracking-tight ${activity.use_dark_text ? \'text-zinc-900\' : \'text-white\'}`}'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated Activity Page');
