export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { playerIds, title, message } = req.body;
  if (!title || !message) return res.status(400).json({ error: 'Missing title or message' });

  const OID = 'ba106603-ca56-424d-a82d-564cde853c6b';
  const OR = 'os_v2_app_xiigma6kkzbe3kbnkzgn5bj4nnydat3ibdxeum4maxa7ywunof6zpnmzkxgu3xri6da5zxaxqb3nnzp6hle6333zns57fm3zb6xn74a';

  try {
    const body = {
      app_id: OID,
      headings: { fr: title, en: title },
      contents: { fr: message, en: message },
    };

    if (playerIds && playerIds.length > 0) {
      body.include_subscription_ids = playerIds;
    } else {
      body.included_segments = ['All'];
    }

    console.log('Sending push:', JSON.stringify(body));

    const response = await fetch('https://api.onesignal.com/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OR}`
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
