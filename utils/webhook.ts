export async function sendWebhook(payload: {
    type: string;
    action: string;
    id: string;
    data: any;
}) {
    try {
        const webhookUrl = process.env.NEXT_PUBLIC_GOOGLE_SHEET_WEBHOOK_URL;
        if (!webhookUrl) {
            console.warn("Webhook URL not found in environment variables.");
            return;
        }

        // Fire and forget without blocking
        fetch(webhookUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        }).catch((error) => {
            console.error("Failed to send webhook:", error);
        });
    } catch (error) {
        console.error("Error in sendWebhook:", error);
    }
}
