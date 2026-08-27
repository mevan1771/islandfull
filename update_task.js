const fs = require('fs');
const path = require('path');

const filePath = 'C:\\Users\\mevan\\.gemini\\antigravity\\brain\\80eabb03-5780-460f-bfaf-9c4e8209affa\\task.md';
let content = fs.readFileSync(filePath, 'utf8');

content += `
## 33. Create Global Header
- [ ] Create \`components/layout/GlobalHeader.tsx\` with solid white background, sticky top, back arrow, logo, and utility icons.
- [ ] Add \`GlobalHeader\` to \`app/activity/[slug]/page.tsx\`.
- [ ] Remove old \`MobileBackButton\` and dark gradient overlay from the cover image in \`app/activity/[slug]/page.tsx\`.
- [ ] Commit and push changes.
`;

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated task.md');
