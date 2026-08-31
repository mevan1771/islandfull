const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'activity', 'ActivityCard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add imports
content = content.replace(
    `import { FavoriteButton } from "@/components/ui/FavoriteButton"`,
    `import { FavoriteButton } from "@/components/ui/FavoriteButton"\nimport { CountdownTimer } from "@/components/ui/CountdownTimer"`
);

// 2. Add props to interface
content = content.replace(
    `  priceSuffix?: string\n}`,
    `  priceSuffix?: string\n  discountPrice?: number\n  dealEndDate?: string\n}`
);

// 3. Add props to component
content = content.replace(
    `  priceSuffix,\n}: ActivityCardProps) {`,
    `  priceSuffix,\n  discountPrice,\n  dealEndDate,\n}: ActivityCardProps) {`
);

// 4. Add state for active deal
content = content.replace(
    `  const videoRef = useRef<HTMLVideoElement>(null)`,
    `  const videoRef = useRef<HTMLVideoElement>(null)\n  const [isDealActive, setIsDealActive] = useState(false)\n\n  useEffect(() => {\n    if (discountPrice && dealEndDate) {\n      const endDate = new Date(dealEndDate)\n      if (endDate > new Date()) {\n        setIsDealActive(true)\n      }\n    }\n  }, [discountPrice, dealEndDate])`
);

// 5. Update pricing display
const pricingRegex = /\{priceUsd === 0 \? \([\s\S]*?\) : \([\s\S]*?<>\s*<span className="text-sm sm:text-base font-bold text-gray-900">\$(\{priceUsd\})<\/span>\s*<span className="text-\[10px\] sm:text-xs font-normal text-gray-500">\s*\{priceSuffix \? ` \$\{priceSuffix\}` : ''\}\s*<\/span>\s*<\/>\s*\)\}/;

const newPricing = `{priceUsd === 0 ? (
                  <span className="text-xs sm:text-sm font-bold text-emerald-600">Free</span>
                ) : (
                  <>
                    {isDealActive && discountPrice ? (
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm sm:text-base font-bold text-rose-600">\${discountPrice}</span>
                          <span className="text-xs font-medium text-gray-400 line-through">\${priceUsd}</span>
                        </div>
                        <span className="text-[10px] sm:text-xs font-normal text-gray-500">
                          {priceSuffix ? \` \${priceSuffix}\` : ''}
                        </span>
                      </div>
                    ) : (
                      <>
                        <span className="text-sm sm:text-base font-bold text-gray-900">\${priceUsd}</span>
                        <span className="text-[10px] sm:text-xs font-normal text-gray-500">
                          {priceSuffix ? \` \${priceSuffix}\` : ''}
                        </span>
                      </>
                    )}
                  </>
                )}`;

content = content.replace(pricingRegex, newPricing);

// 6. Add CountdownTimer below the price
const durationRegex = /<span className="text-gray-300 text-\[10px\] sm:text-xs flex-shrink-0">•<\/span>\s*<span className="text-\[10px\] sm:text-xs font-normal text-gray-500 truncate">\{duration\}<\/span>\s*<\/div>/;

const newDuration = `<span className="text-gray-300 text-[10px] sm:text-xs flex-shrink-0">•</span>
              <span className="text-[10px] sm:text-xs font-normal text-gray-500 truncate">{duration}</span>
            </div>
            {isDealActive && dealEndDate && (
              <div className="mt-2">
                <CountdownTimer targetDate={dealEndDate} onExpire={() => setIsDealActive(false)} />
              </div>
            )}`;

content = content.replace(durationRegex, newDuration);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated ActivityCard.tsx');
