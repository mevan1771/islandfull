const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'activity', 'ActivityCard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const oldPricing = `                    {isDealActive && discountPrice ? (
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm sm:text-base font-bold text-rose-600">\${discountPrice}</span>
                          <span className="text-xs font-medium text-gray-400 line-through">\${priceUsd}</span>
                        </div>
                        <span className="text-[10px] sm:text-xs font-normal text-gray-500">
                          {priceSuffix ? \` \${priceSuffix}\` : ''}
                        </span>
                      </div>
                    ) : (`;

const newPricing = `                    {isDealActive && discountPrice ? (
                      <>
                        <del className="text-xs text-gray-400 mr-1">\${priceUsd}</del>
                        <span className="font-bold text-lg text-gray-900">\${discountPrice}</span>
                        <span className="text-[10px] sm:text-xs font-normal text-gray-500">
                          {priceSuffix ? \` \${priceSuffix}\` : ''}
                        </span>
                      </>
                    ) : (`;

content = content.replace(oldPricing, newPricing);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated ActivityCard.tsx');
