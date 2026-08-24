export type CancellationTier = 'FLEXIBLE' | 'MODERATE' | 'STRICT' | 'NON_REFUNDABLE';

/**
 * Calculates the exact cutoff date for a full refund based on the start date and cancellation tier.
 * @param startDate The date of the activity/tour.
 * @param tier The cancellation tier.
 * @returns The cutoff date for a full refund, or null if non-refundable.
 */
export function calculateRefundCutoffDate(startDate: Date | string, tier: CancellationTier | string): Date | null {
    const date = new Date(startDate);

    switch (tier) {
        case 'FLEXIBLE':
            // 24 hours prior
            date.setHours(date.getHours() - 24);
            return date;
        case 'MODERATE':
            // 7 days prior
            date.setDate(date.getDate() - 7);
            return date;
        case 'STRICT':
            // 14 days prior
            date.setDate(date.getDate() - 14);
            return date;
        case 'NON_REFUNDABLE':
        default:
            return null;
    }
}

/**
 * Returns a user-friendly string explaining the cancellation policy.
 * @param startDate The date of the activity/tour.
 * @param tier The cancellation tier.
 * @returns A user-friendly string.
 */
export function getCancellationPolicyText(startDate: Date | string, tier: CancellationTier | string): string {
    const cutoffDate = calculateRefundCutoffDate(startDate, tier);

    if (!cutoffDate || tier === 'NON_REFUNDABLE') {
        return 'Non-refundable. No refunds will be issued for cancellations.';
    }

    const formattedDate = cutoffDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

    return `Cancel before ${formattedDate} for a full refund.`;
}
