const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app', 'admin', 'tours', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const oldPricing = `                      <td className="px-6 py-4">
                        <div className="font-bold text-rose-500">\${t.price_usd}</div>
                        <div className="text-zinc-400 text-[10px] mt-0.5 uppercase tracking-wide">LKR {t.price_lkr_approx}</div>
                      </td>`;

const newPricing = `                      <td className="px-6 py-4">
                        {t.discount_price && t.deal_end_date && new Date(t.deal_end_date) > new Date() && t.discount_price < t.price_usd ? (
                          <div className="flex flex-col">
                            <span className="line-through text-gray-400 text-xs">\${t.price_usd}</span>
                            <span className="font-bold text-green-600">\${t.discount_price}</span>
                          </div>
                        ) : (
                          <div className="font-bold text-rose-500">\${t.price_usd}</div>
                        )}
                        <div className="text-zinc-400 text-[10px] mt-0.5 uppercase tracking-wide">LKR {t.price_lkr_approx}</div>
                      </td>`;

content = content.replace(oldPricing, newPricing);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated Admin Tours Table UI');
