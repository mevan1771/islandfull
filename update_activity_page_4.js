const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app', 'activity', '[slug]', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
    '<div className="relative h-[35svh] md:h-[600px] m-3 sm:m-0 md:mx-auto md:w-full max-w-[1400px] rounded-2xl sm:rounded-3xl overflow-hidden">',
    '<div className="relative h-[35svh] md:h-[600px] w-full md:mx-auto md:mt-6 max-w-[1400px] rounded-none sm:rounded-3xl overflow-hidden">'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated Activity Page');
