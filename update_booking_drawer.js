const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'activity', 'BookingDrawer.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add CountdownTimer import
content = content.replace(
    `import { FavoriteButton } from "@/components/ui/FavoriteButton"`,
    `import { FavoriteButton } from "@/components/ui/FavoriteButton"\nimport { CountdownTimer } from "@/components/ui/CountdownTimer"`
);

// 2. Add props to interface
content = content.replace(
    `  cancellationTierData?: any\n}`,
    `  cancellationTierData?: any\n  discountPrice?: number\n  dealEndDate?: string\n}`
);

// 3. Add props to component
content = content.replace(
    `  cancellationTierData\n}: BookingDrawerProps) {`,
    `  cancellationTierData,\n  discountPrice,\n  dealEndDate\n}: BookingDrawerProps) {`
);

// 4. Add state for active deal
content = content.replace(
    `  const [agreedToPolicies, setAgreedToPolicies] = useState(false)`,
    `  const [agreedToPolicies, setAgreedToPolicies] = useState(false)\n\n  const [isDealActive, setIsDealActive] = useState(false)\n  useEffect(() => {\n    if (discountPrice && dealEndDate) {\n      const endDate = new Date(dealEndDate)\n      if (endDate > new Date()) {\n        setIsDealActive(true)\n      }\n    }\n  }, [discountPrice, dealEndDate])\n\n  const effectivePriceUsd = isDealActive && discountPrice ? discountPrice : priceUsd;`
);

// 5. Update total calculation
content = content.replace(
    `  } else if (pricingModel === 'flat_rate') {\n    totalUsd = priceUsd;\n  } else {\n    totalUsd = priceUsd * guests;\n  }`,
    `  } else if (pricingModel === 'flat_rate') {\n    totalUsd = effectivePriceUsd;\n  } else {\n    totalUsd = effectivePriceUsd * guests;\n  }`
);

// 6. Update pricing display in the header
const headerPricingRegex = /\{priceUsd === 0 \? \([\s\S]*?\) : \([\s\S]*?<span className="text-lg md:text-3xl font-bold text-zinc-900">\{formatUSD\(pricingTiers && pricingTiers\["1"\] \? pricingTiers\["1"\] : priceUsd\)\}<\/span>\s*\)\}/;

const newHeaderPricing = `{priceUsd === 0 ? (
                  <span className="text-lg md:text-3xl font-black text-emerald-500 tracking-tight uppercase">Free</span>
                ) : (
                  <div className="flex flex-col">
                    {isDealActive && discountPrice ? (
                      <div className="flex items-center gap-2">
                        <span className="text-lg md:text-3xl font-bold text-rose-600">{formatUSD(discountPrice)}</span>
                        <span className="text-sm md:text-lg font-medium text-gray-400 line-through">{formatUSD(pricingTiers && pricingTiers["1"] ? pricingTiers["1"] : priceUsd)}</span>
                      </div>
                    ) : (
                      <span className="text-lg md:text-3xl font-bold text-zinc-900">{formatUSD(pricingTiers && pricingTiers["1"] ? pricingTiers["1"] : priceUsd)}</span>
                    )}
                  </div>
                )}`;

content = content.replace(headerPricingRegex, newHeaderPricing);

// 7. Add CountdownTimer below the pricing label
const pricingLabelRegex = /\{priceUsd !== 0 && <span className="text-\[10px\] md:text-sm text-zinc-500 font-medium">\{getPricingLabel\(\)\}<\/span>\}/;

const newPricingLabel = `{priceUsd !== 0 && <span className="text-[10px] md:text-sm text-zinc-500 font-medium">{getPricingLabel()}</span>}
              {isDealActive && dealEndDate && (
                <div className="mt-1">
                  <CountdownTimer targetDate={dealEndDate} onExpire={() => setIsDealActive(false)} />
                </div>
              )}`;

content = content.replace(pricingLabelRegex, newPricingLabel);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated BookingDrawer.tsx');
