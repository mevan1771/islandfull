const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'activity', 'BookingDrawer.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Ensure CreditCard is imported from lucide-react
if (!content.includes('CreditCard')) {
    content = content.replace(/import {([^}]+)} from "lucide-react"/, 'import { $1, CreditCard } from "lucide-react"');
}

const oldFooter = `          <p className="hidden md:block text-center text-sm font-medium text-zinc-400 mt-1">
            {priceUsd === 0 ? "Complete Reservation" :
              paymentStrategy === 'no_card' ? "Reserve now. We'll send your invoice later." :
                paymentStrategy === 'deposit_15' ? "Pay 15% now, rest in cash to your guide." :
                  paymentStrategy === 'manual_hold' ? "Zero charge today. Card held for 24 hours." :
                    "Secure checkout with Stripe."}
          </p>`;

const newFooter = `          <div className="hidden md:flex items-center justify-center gap-2 text-center text-sm font-medium text-zinc-500 mt-2">
            {priceUsd === 0 ? "Complete Reservation" :
              paymentStrategy === 'no_card' ? (
                <>
                  <CreditCard className="w-4 h-4" />
                  Reserve now. We'll send your invoice later. No credit card required.
                </>
              ) :
                paymentStrategy === 'deposit_15' ? "Pay 15% now, rest in cash to your guide." :
                  paymentStrategy === 'manual_hold' ? "Zero charge today. Card held for 24 hours." :
                    "Secure checkout with Stripe."}
          </div>`;

content = content.replace(oldFooter, newFooter);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully enforced footer message in BookingDrawer.tsx');
