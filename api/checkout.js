export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { amount, orderNum, email, description, returnUrl } = req.body;

  if (!amount || !orderNum) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

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
        description: description || `Poketime Rueil #${String(orderNum).padStart(4, '0')}`,
        return_url: returnUrl || `${process.env.APP_URL || 'https://poketime-order.vercel.app'}?paid=1&num=${orderNum}&email=${encodeURIComponent(email || '')}`,
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SumUp error:', errorText);
      return res.status(response.status).json({ error: 'SumUp API error', details: errorText });
    }

    const data = await response.json();
    return res.status(200).json({
      checkoutId: data.id,
      hostedCheckoutUrl: data.hosted_checkout_url
    });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
