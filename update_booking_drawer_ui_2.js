const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'activity', 'BookingDrawer.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const oldPricingHeader = `            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                {priceUsd === 0 ? (
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
                )}
                {paymentStrategy === 'no_card' && priceUsd !== 0 && <span className="hidden md:inline-flex px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-wider">⚡️ No Card Needed</span>}
                {paymentStrategy === 'deposit_15' && <span className="hidden md:inline-flex px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-[10px] font-black uppercase tracking-wider">🔥 Pay 15% Today</span>}
                {paymentStrategy === 'manual_hold' && <span className="hidden md:inline-flex px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-wider">🔒 Pay Later</span>}
              </div>
              {priceUsd !== 0 && <span className="text-[10px] md:text-sm text-zinc-500 font-medium">{getPricingLabel()}</span>}
              {isDealActive && dealEndDate && (
                <div className="mt-1">
                  <CountdownTimer targetDate={dealEndDate} onExpire={() => setIsDealActive(false)} />
                </div>
              )}
            </div>`;

const newPricingHeader = `            <div className="flex flex-col w-full">
              {/* Auxiliary Badges Row */}
              <div className="flex items-center gap-2 mb-1">
                {paymentStrategy === 'deposit_15' && <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-[10px] font-black uppercase tracking-wider">🔥 Pay 15% Today</span>}
                {paymentStrategy === 'manual_hold' && <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-wider">🔒 Pay Later</span>}
              </div>

              <div className="flex items-baseline gap-2">
                {priceUsd === 0 ? (
                  <span className="text-lg md:text-3xl font-black text-emerald-500 tracking-tight uppercase">Free</span>
                ) : (
                  <>
                    {isDealActive && discountPrice ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gray-900">{formatUSD(discountPrice)}</span>
                        <span className="text-sm text-gray-500 line-through">{formatUSD(pricingTiers && pricingTiers["1"] ? pricingTiers["1"] : priceUsd)}</span>
                      </div>
                    ) : (
                      <span className="text-lg md:text-3xl font-bold text-zinc-900">{formatUSD(pricingTiers && pricingTiers["1"] ? pricingTiers["1"] : priceUsd)}</span>
                    )}
                  </>
                )}
              </div>
              {priceUsd !== 0 && <span className="text-[10px] md:text-sm text-zinc-500 font-medium">{getPricingLabel()}</span>}
              
              {isDealActive && dealEndDate && (
                <div className="mt-2 w-full bg-rose-50 rounded-md p-2 flex items-center justify-center">
                  <CountdownTimer targetDate={dealEndDate} onExpire={() => setIsDealActive(false)} />
                </div>
              )}
            </div>`;

content = content.replace(oldPricingHeader, newPricingHeader);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated BookingDrawer.tsx pricing header');
