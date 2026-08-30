const fs = require('fs');
const path = require('path');

const actionsPath = path.join(__dirname, 'app', 'actions', 'tours.ts');
let actionsContent = fs.readFileSync(actionsPath, 'utf8');

// 1. Update createTour
actionsContent = actionsContent.replace(
    /const blackout_dates_raw = formData\.get\("blackout_dates"\) as string/,
    `const blackout_dates_raw = formData.get("blackout_dates") as string\n    const faqs_raw = formData.get("faqs") as string`
);

actionsContent = actionsContent.replace(
    /let blackout_dates = \[\];\n    try \{\n      if \(blackout_dates_raw\) \{\n        blackout_dates = JSON\.parse\(blackout_dates_raw\);\n      \}\n    \} catch \(e\) \{\n      console\.warn\("Failed to parse blackout_dates:", e\);\n    \}/,
    `let blackout_dates = [];\n    try {\n      if (blackout_dates_raw) {\n        blackout_dates = JSON.parse(blackout_dates_raw);\n      }\n    } catch (e) {\n      console.warn("Failed to parse blackout_dates:", e);\n    }\n\n    let faqs = [];\n    try {\n      if (faqs_raw) {\n        faqs = JSON.parse(faqs_raw);\n      }\n    } catch (e) {\n      console.warn("Failed to parse faqs:", e);\n    }`
);

actionsContent = actionsContent.replace(
    /blackout_dates,\n      status\n    \}/,
    `blackout_dates,\n      faqs,\n      status\n    }`
);

// 2. Update updateTour
actionsContent = actionsContent.replace(
    /const blackout_dates_raw = formData\.get\("blackout_dates"\) as string/g,
    `const blackout_dates_raw = formData.get("blackout_dates") as string\n    const faqs_raw = formData.get("faqs") as string`
);

actionsContent = actionsContent.replace(
    /let blackout_dates = \[\];\n    try \{\n      if \(blackout_dates_raw\) \{\n        blackout_dates = JSON\.parse\(blackout_dates_raw\);\n      \}\n    \} catch \(e\) \{\n      console\.warn\("Failed to parse blackout_dates:", e\);\n    \}/g,
    `let blackout_dates = [];\n    try {\n      if (blackout_dates_raw) {\n        blackout_dates = JSON.parse(blackout_dates_raw);\n      }\n    } catch (e) {\n      console.warn("Failed to parse blackout_dates:", e);\n    }\n\n    let faqs = [];\n    try {\n      if (faqs_raw) {\n        faqs = JSON.parse(faqs_raw);\n      }\n    } catch (e) {\n      console.warn("Failed to parse faqs:", e);\n    }`
);

actionsContent = actionsContent.replace(
    /blackout_dates,\n      status\n    \}/g,
    `blackout_dates,\n      faqs,\n      status\n    }`
);

fs.writeFileSync(actionsPath, actionsContent, 'utf8');
console.log('Successfully updated tours.ts');
