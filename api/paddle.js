export default async function handler(req, res) {
  try {
    const payload = req.body.data || req.body;

    const product =
      payload.details?.line_items?.[0]?.product?.name ||
      payload.items?.[0]?.price?.name ||
      "Unknown Product";

    const currency =
      payload.details?.totals?.currency_code ||
      payload.currency_code ||
      "";

    const amountPaid = (
      Number(payload.details?.totals?.grand_total || 0) / 100
    ).toFixed(2);

    const discount = (
      Number(payload.details?.totals?.discount || 0) / 100
    ).toFixed(2);

    const taxWithheld = (
      Number(payload.details?.totals?.tax || 0) / 100
    ).toFixed(2);

    const paddleFee = (
      Number(payload.details?.totals?.fee || 0) / 100
    ).toFixed(2);

    const netAmount = (
      Number(payload.details?.totals?.earnings || 0) / 100
    ).toFixed(2);

    const totalEarnings = (
      Number(payload.details?.payout_totals?.earnings || 0) / 100
    ).toFixed(2);

    const totalEarningsCurrency =
      payload.details?.payout_totals?.currency_code || "USD";

    const methodDetails =
      payload.payments?.[0]?.method_details;

    let paymentType = "Unknown";
    let name = "Unknown";

    if (methodDetails?.type === "card" && methodDetails.card) {
      paymentType =
        methodDetails.card.type?.toUpperCase() || "Card";
      name =
        methodDetails.card.cardholder_name || "Unknown";
    }

    if (methodDetails?.type === "paypal" && methodDetails.paypal) {
      paymentType = "PayPal";
      name =
        methodDetails.paypal.email || "Unknown";
    }

    const slackResponse = await fetch(
      process.env.SLACK_WEBHOOK_URL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          text: `🎉 *New Paddle Sale*

📦 *Product:* ${product}

💰 *Amount Paid:* ${amountPaid} ${currency}
🎟️ *Discount:* ${discount} ${currency}
🧾 *Tax Withheld:* ${taxWithheld} ${currency}
💸 *Paddle Fee:* ${paddleFee} ${currency}

💶 *Net Amount:* ${netAmount} ${currency}
💵 *Total Earnings:* ${totalEarnings} ${totalEarningsCurrency}

💳 *Payment Type:* ${paymentType}
👤 *Name:* ${name}

🆔 *Transaction:* ${payload.id}`
        })
      }
    );

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
