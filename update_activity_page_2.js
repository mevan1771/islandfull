const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app', 'activity', '[slug]', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const lines = content.split('\n');

const favBtnIndex = lines.findIndex(line => line.includes('<FavoriteButton activityId={activity.id} className="hidden md:flex" useDarkText={activity.use_dark_text} />'));
if (favBtnIndex !== -1) {
    lines[favBtnIndex] = '            <FavoriteButton activityId={activity.id} className="hidden md:flex" useDarkTextDesktop={activity.use_dark_text_desktop} useDarkTextMobile={activity.use_dark_text_mobile} />';
}

const titleIndex = lines.findIndex(line => line.includes('className={`text-[clamp(0.875rem,calc(120vw/var(--char-count)),1.25rem)] whitespace-nowrap overflow-hidden text-ellipsis md:text-4xl md:leading-tight md:whitespace-normal md:overflow-visible font-bold tracking-tight ${activity.use_dark_text ? \'text-slate-700/80\' : \'text-white\'}`}'));
if (titleIndex !== -1) {
    lines[titleIndex] = '                                className={`text-[clamp(0.875rem,calc(120vw/var(--char-count)),1.25rem)] whitespace-nowrap overflow-hidden text-ellipsis md:text-4xl md:leading-tight md:whitespace-normal md:overflow-visible font-bold tracking-tight ${activity.use_dark_text_mobile ? \'text-slate-700/80\' : \'text-white\'} ${activity.use_dark_text_desktop ? \'md:text-slate-700/80\' : \'md:text-white\'}`}'
}

fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log('Successfully updated Activity Page');
