const fs = require('fs');
const path = require('path');

// Update Activity Page
const pagePath = path.join(__dirname, 'app', 'activity', '[slug]', 'page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');

pageContent = pageContent.replace(
    '<HeaderThemeSetter useDarkText={activity.use_dark_text} />',
    '<HeaderThemeSetter useDarkTextDesktop={activity.use_dark_text_desktop} useDarkTextMobile={activity.use_dark_text_mobile} />'
);

pageContent = pageContent.replace(
    'className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight ${activity.use_dark_text ? \'text-slate-700/80\' : \'text-white\'}`}',
    'className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight ${activity.use_dark_text_mobile ? \'text-slate-700/80\' : \'text-white\'} ${activity.use_dark_text_desktop ? \'md:text-slate-700/80\' : \'md:text-white\'}`}'
);

pageContent = pageContent.replace(
    '<MobileBackButton useDarkText={activity.use_dark_text} />',
    '<MobileBackButton useDarkTextMobile={activity.use_dark_text_mobile} />'
);

pageContent = pageContent.replace(
    '<FavoriteButton activityId={activity.id} useDarkText={activity.use_dark_text} />',
    '<FavoriteButton activityId={activity.id} useDarkTextDesktop={activity.use_dark_text_desktop} useDarkTextMobile={activity.use_dark_text_mobile} />'
);

fs.writeFileSync(pagePath, pageContent, 'utf8');

// Update MobileBackButton
const mobileBackPath = path.join(__dirname, 'components', 'ui', 'MobileBackButton.tsx');
let mobileBackContent = fs.readFileSync(mobileBackPath, 'utf8');

mobileBackContent = mobileBackContent.replace(
    'export function MobileBackButton({ useDarkText = false }: { useDarkText?: boolean }) {',
    'export function MobileBackButton({ useDarkTextMobile = false }: { useDarkTextMobile?: boolean }) {'
);

mobileBackContent = mobileBackContent.replace(
    'const iconColor = useDarkText ? \'stroke-slate-700/80\' : \'stroke-white\'',
    'const iconColor = useDarkTextMobile ? \'stroke-slate-700/80\' : \'stroke-white\''
);

mobileBackContent = mobileBackContent.replace(
    'const iconBg = useDarkText ? \'bg-black/5\' : \'bg-black/20\'',
    'const iconBg = useDarkTextMobile ? \'bg-black/5\' : \'bg-black/20\''
);

fs.writeFileSync(mobileBackPath, mobileBackContent, 'utf8');

// Update FavoriteButton
const favoritePath = path.join(__dirname, 'components', 'ui', 'FavoriteButton.tsx');
let favoriteContent = fs.readFileSync(favoritePath, 'utf8');

favoriteContent = favoriteContent.replace(
    'export function FavoriteButton({ activityId, useDarkText = false }: { activityId: string, useDarkText?: boolean }) {',
    'export function FavoriteButton({ activityId, useDarkTextDesktop = false, useDarkTextMobile = false }: { activityId: string, useDarkTextDesktop?: boolean, useDarkTextMobile?: boolean }) {'
);

favoriteContent = favoriteContent.replace(
    'const iconColor = useDarkText ? \'stroke-slate-700/80\' : \'stroke-white\'',
    'const iconColor = `${useDarkTextMobile ? \'stroke-slate-700/80\' : \'stroke-white\'} ${useDarkTextDesktop ? \'md:stroke-slate-700/80\' : \'md:stroke-white\'}`'
);

favoriteContent = favoriteContent.replace(
    'const iconBg = useDarkText ? \'bg-black/5 md:bg-black/5\' : \'bg-black/20 md:bg-white/20\'',
    'const iconBg = `${useDarkTextMobile ? \'bg-black/5\' : \'bg-black/20\'} ${useDarkTextDesktop ? \'md:bg-black/5\' : \'md:bg-white/20\'}`'
);

favoriteContent = favoriteContent.replace(
    'const iconBorder = useDarkText ? \'md:border-black/10\' : \'md:border-white/20\'',
    'const iconBorder = `${useDarkTextMobile ? \'border-transparent\' : \'border-transparent\'} ${useDarkTextDesktop ? \'md:border-black/10\' : \'md:border-white/20\'}`'
);

favoriteContent = favoriteContent.replace(
    'const iconHoverBg = useDarkText ? \'md:hover:bg-black/10\' : \'md:hover:bg-white/30\'',
    'const iconHoverBg = `${useDarkTextMobile ? \'hover:bg-black/10\' : \'hover:bg-white/30\'} ${useDarkTextDesktop ? \'md:hover:bg-black/10\' : \'md:hover:bg-white/30\'}`'
);

fs.writeFileSync(favoritePath, favoriteContent, 'utf8');

console.log('Successfully updated Activity Page and Buttons');
