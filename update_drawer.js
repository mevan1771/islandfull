const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'activity', 'BookingDrawer.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(
    'import { getCancellationPolicyText } from "@/utils/cancellation"',
    'import { getCancellationPolicyText, CancellationTierData } from "@/utils/cancellation"\nimport { Checkbox } from "@/components/ui/checkbox"'
);

content = content.replace(
    'cancellationTier?: string',
    'cancellationTierData?: CancellationTierData | null'
);

content = content.replace(
    "cancellationTier = 'MODERATE'",
    'cancellationTierData'
);

content = content.replace(
    'const [isApplyingPromo, setIsApplyingPromo] = useState(false)',
    'const [isApplyingPromo, setIsApplyingPromo] = useState(false)\n\n  // Policy Agreement State\n  const [agreedToPolicies, setAgreedToPolicies] = useState(false)'
);

content = content.replace(
    'getCancellationPolicyText(selectedDateForPolicy, cancellationTier)',
    'getCancellationPolicyText(selectedDateForPolicy, cancellationTierData || null)'
);

content = content.replace(
    'if (!finalDate || !whatsapp || !touristName || !touristEmail || (isMulti && !finalEndDate)) return',
    'if (!finalDate || !whatsapp || !touristName || !touristEmail || (isMulti && !finalEndDate)) return\n    if (!agreedToPolicies) {\n      alert("You must agree to the Global Terms and Cancellation Policy to proceed.")\n      return\n    }'
);

content = content.replace(
    'setDiscountUsd(0)\n    }, 300)',
    'setDiscountUsd(0)\n      setAgreedToPolicies(false)\n    }, 300)'
);

const buttonBlock = `<Button
                onClick={(e) => { e.preventDefault(); handleStripeCheckout(); }}
                disabled={(bookingType === 'multi_day' ? !dateRange?.from : !date) || !whatsapp || !touristName || !touristEmail}
                className={\`w-full h-14 text-lg font-bold rounded-xl transition-all shadow-xl shadow-rose-500/20\`}
              >
                {priceUsd === 0
                  ? "Complete Reservation"
                  : "Proceed to Payment"}
              </Button>`;

const newButtonBlock = `                  {/* Policy Agreement Checkbox */}
                  <div className="flex items-start space-x-3 pt-4 border-t border-zinc-100 mb-4">
                    <Checkbox 
                      id="policy-agreement" 
                      checked={agreedToPolicies} 
                      onCheckedChange={(checked) => setAgreedToPolicies(checked as boolean)}
                      className="mt-1"
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label 
                        htmlFor="policy-agreement" 
                        className="text-sm font-medium leading-tight cursor-pointer text-zinc-700"
                      >
                        I agree to the <a href="/terms" target="_blank" className="text-rose-500 hover:underline">Global Terms</a> and the <a href="/cancellation-policy" target="_blank" className="text-rose-500 hover:underline">{cancellationTierData?.name || 'Cancellation'} Policy</a>.
                      </label>
                      <p className="text-xs text-zinc-500">
                        {cancellationPolicy}
                      </p>
                    </div>
                  </div>

              <Button
                onClick={(e) => { e.preventDefault(); handleStripeCheckout(); }}
                disabled={(bookingType === 'multi_day' ? !dateRange?.from : !date) || !whatsapp || !touristName || !touristEmail || !agreedToPolicies}
                className={\`w-full h-14 text-lg font-bold rounded-xl transition-all shadow-xl shadow-rose-500/20\`}
              >
                {priceUsd === 0
                  ? "Complete Reservation"
                  : "Proceed to Payment"}
              </Button>`;

content = content.replace(buttonBlock, newButtonBlock);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated BookingDrawer.tsx');
