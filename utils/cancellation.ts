export interface CancellationTierData {
    id: string;
    name: string;
    cutoff_hours: number;
    refund_percentage: number;
}

/**
 * Calculates the exact cutoff date for a full refund based on the start date and cancellation tier data.
 * @param startDate The date of the activity/tour.
 * @param tierData The cancellation tier data from the database.
 * @returns The cutoff date for a full refund, or null if non-refundable.
 */
export function calculateRefundCutoffDate(startDate: Date | string, tierData: CancellationTierData | null): Date | null {
    if (!tierData || tierData.id === 'NON_REFUNDABLE' || tierData.refund_percentage === 0) {
        return null;
    }

    const date = new Date(startDate);
    date.setHours(date.getHours() - tierData.cutoff_hours);
    return date;
}

/**
 * Returns a user-friendly string explaining the cancellation policy.
 * @param startDate The date of the activity/tour.
 * @param tierData The cancellation tier data from the database.
 * @returns A user-friendly string.
 */
export function getCancellationPolicyText(startDate: Date | string, tierData: CancellationTierData | null): string {
    const cutoffDate = calculateRefundCutoffDate(startDate, tierData);

    if (!cutoffDate || !tierData || tierData.id === 'NON_REFUNDABLE' || tierData.refund_percentage === 0) {
        return 'Non-refundable. No refunds will be issued for cancellations.';
    }

    const formattedDate = cutoffDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

    return `Cancel before ${formattedDate} for a ${tierData.refund_percentage}% refund.`;
}
