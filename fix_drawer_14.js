const fs = require('fs');
const path = require('path');

const drawerPath = path.join(__dirname, 'components', 'activity', 'BookingDrawer.tsx');
let drawerContent = fs.readFileSync(drawerPath, 'utf8');

const oldLogic = `  let totalUsd = 0;
  if (pricingTiers && pricingTiers[guests.toString()]) {
    // The tier price IS the flat total price for this specific group size
    totalUsd = pricingTiers[guests.toString()];
  } else if (pricingModel === 'flat_rate') {
    totalUsd = priceUsd;
  } else {
    // Default fallback: base price * number of guests
    totalUsd = priceUsd * guests;
  }`;

const newLogic = `  let totalUsd = 0;
  let appliedTierPrice: number | null = null;

  if (pricingTiers && Object.keys(pricingTiers).length > 0) {
    // 1. Implement Threshold Sorting (highest guest count first)
    const sortedTiers = Object.entries(pricingTiers)
      .map(([guestCountStr, price]) => ({
        threshold: parseInt(guestCountStr, 10),
        price: price as number
      }))
      .sort((a, b) => b.threshold - a.threshold);

    // 2. Find the Applicable Tier
    for (const tier of sortedTiers) {
      if (guests >= tier.threshold) {
        appliedTierPrice = tier.price;
        break;
      }
    }
  }

  // 3 & 4. Apply Tier Price or Fallback
  if (appliedTierPrice !== null) {
    totalUsd = appliedTierPrice;
  } else if (pricingModel === 'flat_rate') {
    totalUsd = priceUsd;
  } else {
    // Default fallback: base price * number of guests
    totalUsd = priceUsd * guests;
  }`;

drawerContent = drawerContent.replace(oldLogic, newLogic);

fs.writeFileSync(drawerPath, drawerContent, 'utf8');
console.log('Successfully updated BookingDrawer.tsx');
