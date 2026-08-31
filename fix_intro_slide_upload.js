const fs = require('fs');
const path = require('path');

// 1. Fix IntroSlideConfig.tsx
const introPath = path.join(__dirname, 'components', 'admin', 'IntroSlideConfig.tsx');
let introContent = fs.readFileSync(introPath, 'utf8');

introContent = introContent.replace(
    `setData({ ...data, cover_image_url: res.url })`,
    `setData({ ...data, cover_image_url: res.secure_url })`
);

fs.writeFileSync(introPath, introContent, 'utf8');
console.log('Successfully updated IntroSlideConfig.tsx');

// 2. Fix app/actions/settings.ts
const settingsPath = path.join(__dirname, 'app', 'actions', 'settings.ts');
let settingsContent = fs.readFileSync(settingsPath, 'utf8');

settingsContent = settingsContent.replace(
    `revalidatePath('/', 'layout')`,
    `revalidatePath('/', 'layout')\n    revalidatePath('/', 'page')`
);

fs.writeFileSync(settingsPath, settingsContent, 'utf8');
console.log('Successfully updated settings.ts');
