export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { playerIds, title, message, segment } = req.body;
  if (!title || !message) return res.status(400).json({ error: 'Missing title or message' });

  const OID = process.env.ONESIGNAL_APP_ID || 'ba106603-ca56-424d-a82d-564cde853c6b';
  const OR = process.env.ONESIGNAL_REST_KEY;

  if (!OR) return res.status(500).json({ error: 'OneSignal REST key not configured' });

  try {
    const body = {
      app_id: OID,
      headings: { fr: title, en: title },
      contents: { fr: message, en: message },
    };

    if (playerIds && playerIds.length > 0) {
      body.include_subscription_ids = playerIds;
    } else {
      body.included_segments = [segment || 'All'];
    }

    const response = await fetch('https://api.onesignal.com/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${OR}`
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    console.log('OneSignal response:', JSON.stringify(data));
    return res.status(200).json({ success: true, data });

  } catch (error) {
    console.error('Notify error:', error);
    return res.status(500).json({ error: error.message });
  }
}
