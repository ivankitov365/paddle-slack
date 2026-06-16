export default async function handler(req, res) {
  const payload = req.body;

  const product =
    payload.details?.line_items?.[0]?.product?.name || "Unknown Product";

  const amount = (
    Number(payload.details?.totals?.grand_total || 0) / 100
  ).toFixed(2);

  const currency =
    payload.details?.totals?.currency_code || "";

  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      text: `💳 Paddle Transaction Completed

🆔 Transaction ID: ${payload.id}
💰 Amount: ${amount} ${currency}
📦 Product: ${product}
✅ Status: ${payload.status}
📅 Invoice: ${payload.invoice_number}`
    })
  });

  res.status(200).json({ success: true });
}
