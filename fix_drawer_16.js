const fs = require('fs');
const path = require('path');

const drawerPath = path.join(__dirname, 'components', 'activity', 'BookingDrawer.tsx');
let drawerContent = fs.readFileSync(drawerPath, 'utf8');

const brokenLogic = `  // Calculate Totals using Tiered Pricing if available
  const totalDays = (() => {
  }`;

const fixedLogic = `  // Calculate Totals using Tiered Pricing if available
  const totalDays = (() => {
    if (bookingType !== 'multi_day') return 1;
    if (!dateRange?.from) return 0;
    const endDate = dateRange.to || dateRange.from;
    return differenceInDays(endDate, dateRange.from) + 1;
  })();

  let totalUsd = 0;
  let appliedTierPrice: number | null = null;

  if (pricingTiers && Object.keys(pricingTiers).length > 0) {
    // 1. Strict Descending Sort
    const sortedTiers = Object.entries(pricingTiers)
      .map(([guestCountStr, price]) => ({
        guestCount: parseInt(guestCountStr, 10),
        price: price as number
      }))
      .sort((a, b) => b.guestCount - a.guestCount);

    // 2. Find the Highest Applicable Tier
    const activeTier = sortedTiers.find(tier => guests >= tier.guestCount);

    // 3. Apply Value
    if (activeTier) {
      appliedTierPrice = activeTier.price;
    }
  }

  // 4. Fallback
  if (appliedTierPrice !== null) {
    totalUsd = appliedTierPrice;
  } else if (pricingModel === 'flat_rate') {
    totalUsd = priceUsd;
  } else {
    totalUsd = priceUsd * guests;
  }

  // Multiply by days if it's a rental (per_day model)
  if (pricingModel === 'per_day') {
    totalUsd = totalUsd * totalDays;
  }`;

drawerContent = drawerContent.replace(brokenLogic, fixedLogic);

fs.writeFileSync(drawerPath, drawerContent, 'utf8');
console.log('Successfully fixed BookingDrawer.tsx');
