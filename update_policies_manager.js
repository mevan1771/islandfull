const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'admin', 'PoliciesManager.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
    'export default function PoliciesManager() {',
    'export default function PoliciesManager({ initialTiers = [] }: { initialTiers?: any[] }) {'
);

content = content.replace(
    'const [tiers, setTiers] = useState<any[]>([])',
    'const [tiers, setTiers] = useState<any[]>(initialTiers)'
);

content = content.replace(
    `            const [opPolicy, touristPolicy, tiersData] = await Promise.all([
                getLatestPolicy('operator_agreement'),
                getLatestPolicy('tourist_terms'),
                getCancellationTiers()
            ])`,
    `            const [opPolicy, touristPolicy] = await Promise.all([
                getLatestPolicy('operator_agreement'),
                getLatestPolicy('tourist_terms')
            ])`
);

content = content.replace(
    `            if (tiersData) {
                setTiers(tiersData)
            }`,
    ''
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated PoliciesManager.tsx');
