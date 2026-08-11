const fs = require('fs');
const glob = require('glob');
const path = require('path');

const files = glob.sync('app/admin/**/page.tsx');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // The regex matches the container `<div className="flex gap-6 border-b border-zinc-200 mb-8 overflow-x-auto whitespace-nowrap">`
  // and everything up to its closing `</div>` (the one right before BookingsClient or other content)
  // Since it's tricky to parse HTML with regex, we can do string manipulation.
  
  const startStr = '<div className="flex gap-6 border-b border-zinc-200 mb-8 overflow-x-auto whitespace-nowrap">';
  const startIndex = content.indexOf(startStr);
  
  if (startIndex !== -1) {
    // Find the closing div of this block. We know it's a block of links followed by </div>.
    // Let's find the first </div> after the last </Link> in that block.
    // Or just find the next </div> that corresponds to it. Since there are no nested divs inside it, it's just the first </div> after the last </Link>
    let restOfContent = content.substring(startIndex);
    let closingIndex = restOfContent.indexOf('</div>');
    // But wait, there are Link tags inside, which don't have divs. So the first </div> is the closing tag of the container!
    if (closingIndex !== -1) {
      let fullBlock = restOfContent.substring(0, closingIndex + 6);
      content = content.replace(fullBlock, '');
      fs.writeFileSync(file, content);
      console.log(`Updated ${file}`);
    }
  }
});
