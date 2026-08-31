const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'admin', 'TourForm.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Import Zap
content = content.replace(
    `import { Save, Image as ImageIcon, MapPin, Clock, Users, DollarSign, Tag, List, CalendarDays, Percent, Briefcase, Plus, Trash2, GripVertical, MessageCircle } from "lucide-react"`,
    `import { Save, Image as ImageIcon, MapPin, Clock, Users, DollarSign, Tag, List, CalendarDays, Percent, Briefcase, Plus, Trash2, GripVertical, MessageCircle, Zap } from "lucide-react"`
);

// 2. Add Flash Deal section after the pricing grid
const flashDealSection = `
              <div className="p-6 rounded-2xl border-2 border-rose-100 bg-rose-50/50 space-y-6">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-rose-500" />
                  <h3 className="text-lg font-bold text-zinc-900">Flash Deal (Optional)</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-bold text-zinc-800 tracking-wide uppercase">
                      <DollarSign className="w-4 h-4 text-rose-500" />
                      Discounted Price (USD)
                    </label>
                    <div className="relative group">
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-rose-500 font-bold text-lg transition-colors">$</span>
                      <input
                        name="discount_price"
                        type="number"
                        step="0.01"
                        defaultValue={initialData?.discount_price}
                        placeholder="29.99"
                        className="w-full h-14 pl-9 pr-5 rounded-2xl border-2 border-zinc-100 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-bold text-xl text-zinc-900 placeholder:text-zinc-300 bg-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 text-sm font-bold text-zinc-800 tracking-wide uppercase">
                      <CalendarDays className="w-4 h-4 text-rose-500" />
                      Deal Expiration Date
                    </label>
                    <input
                      name="deal_end_date"
                      type="datetime-local"
                      defaultValue={initialData?.deal_end_date ? new Date(initialData.deal_end_date).toISOString().slice(0, 16) : ""}
                      className="w-full h-14 px-5 rounded-2xl border-2 border-zinc-100 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all font-bold text-lg text-zinc-900 bg-white"
                    />
                  </div>
                </div>
              </div>
`;

// Find the end of the pricing grid:
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
//                 ...
//                 <div className="space-y-3">
//                   <label className="flex items-center gap-2 text-sm font-bold text-zinc-800 tracking-wide uppercase">
//                     <DollarSign className="w-4 h-4 text-rose-500" />
//                     Payment Strategy
//                   ...
//                   </select>
//                 </div>
//               </div>

const pricingGridRegex = /<div className="space-y-3">\s*<label className="flex items-center gap-2 text-sm font-bold text-zinc-800 tracking-wide uppercase">\s*<DollarSign className="w-4 h-4 text-rose-500" \/>\s*Payment Strategy\s*<\/label>\s*<select[\s\S]*?<\/select>\s*<\/div>\s*<\/div>/;

content = content.replace(pricingGridRegex, (match) => {
    return match + '\n' + flashDealSection;
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated TourForm.tsx');
