export default async function handler(req, res) {
  try {
    const payload = req.body.data || req.body;

    const product =
      payload.details?.line_items?.[0]?.product?.name ||
      payload.items?.[0]?.price?.name ||
      "Unknown Product";

    const currency =
      payload.details?.totals?.currency_code || payload.currency_code || "";

    const fullPrice = (
      Number(payload.details?.totals?.subtotal || 0) / 100
    ).toFixed(2);

    const discount = (
      Number(payload.details?.totals?.discount || 0) / 100
    ).toFixed(2);

    const amountPaid = (
      Number(payload.details?.totals?.grand_total || 0) / 100
    ).toFixed(2);

    const paddleFee = (
      Number(payload.details?.totals?.fee || 0) / 100
    ).toFixed(2);

    const earningsEur = (
      Number(payload.details?.totals?.earnings || 0) / 100
    ).toFixed(2);

    const earningsUsd = (
      Number(payload.details?.payout_totals?.earnings || 0) / 100
    ).toFixed(2);

    const card = payload.payments?.[0]?.method_details?.card;

    const paymentMethod = card
      ? `${card.type?.toUpperCase()} ****${card.last4}`
      : "Unknown";

    const cardholder = card?.cardholder_name || "Unknown";

    const slackResponse = await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text: `🎉 *New Paddle Sale*

📦 *Product:* ${product}

🏷️ *Full Price:* ${fullPrice} ${currency}
🎟️ *Discount:* ${discount} ${currency}
💰 *Amount Paid:* ${amountPaid} ${currency}
💸 *Paddle Fee:* ${paddleFee} ${currency}
💶 *Earnings:* ${earningsEur} ${currency}
💵 *Earnings:* ${earningsUsd} USD

💳 *Payment:* ${paymentMethod}
👤 *Cardholder:* ${cardholder}

🆔 *Transaction:* ${payload.id}`
      })
    });

    const slackText = await slackResponse.text();

    return res.status(200).json({
      success: true,
      slack_status: slackResponse.status,
      slack_response: slackText
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
