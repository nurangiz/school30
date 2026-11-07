// Vercel Serverless Function: /api/send_bot
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(200).json({ ok: true, message: "30-Maktab Bot Endpoint Faol" });
  }

  try {
    const data = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const message = (data.message || '').trim();

    if (!message) {
      return res.status(400).json({ ok: false, error: 'Xabar matni yo\'q' });
    }

    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8720811902:AAH-cWg0o77k9B6OrRwAVhlkJ0C9Wgv626w";
    const ADMIN_ID = process.env.TELEGRAM_ADMIN_ID || "6125589125";

    const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: ADMIN_ID,
        text: message,
        parse_mode: "Markdown"
      })
    });

    const tgData = await tgRes.json();
    return res.status(200).json({ ok: tgData.ok, result: tgData.result });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
