const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app', 'activity', '[slug]', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const replacement1 = `  if (!activity) {
    notFound();
  }

  let cancellationTierData = null;
  if (activity.cancellation_tier) {
    const { data } = await supabase.from('cancellation_tiers').select('*').eq('id', activity.cancellation_tier).single();
    if (data) cancellationTierData = data;
  }`;

content = content.replace(/  if \(!activity\) \{\r?\n    notFound\(\);\r?\n  \}/g, replacement1);

content = content.replace(
    /cancellationTier=\{activity\.cancellation_tier\}/g,
    'cancellationTierData={cancellationTierData}'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated page.tsx');
