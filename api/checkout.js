export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { amount, orderNum, email, description, returnUrl } = req.body;
  if (!amount || !orderNum) return res.status(400).json({ error: 'Missing fields' });

  try {
    const response = await fetch('https://api.sumup.com/v0.1/checkouts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUMUP_SECRET_KEY}`
      },
      body: JSON.stringify({
        checkout_reference: `poketime-${orderNum}-${Date.now()}`,
        amount: parseFloat(amount),
        currency: 'EUR',
        merchant_code: process.env.SUMUP_MERCHANT_CODE || 'MV7T4VHV',
        description: description || `Poketime Rueil #${String(orderNum).padStart(4,'0')}`,
        return_url: returnUrl
      })
    });

    const data = await response.json();
    console.log('SumUp response:', JSON.stringify(data));

    if (!response.ok) {
      return res.status(response.status).json({ error: 'SumUp error', details: data });
    }

    const checkoutId = data.id;
    if (!checkoutId) {
      return res.status(500).json({ error: 'No checkout ID returned', data });
    }

    return res.status(200).json({
      checkoutId,
      hostedCheckoutUrl: `https://pay.sumup.com/b2c/checkout/${checkoutId}`
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
