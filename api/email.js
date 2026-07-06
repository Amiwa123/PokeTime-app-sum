export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { type, order } = req.body;
  if (!type || !order) return res.status(400).json({ error: 'Missing fields' });

  const RESEND_KEY = process.env.RESEND_API_KEY;
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'poklabulle@gmail.com';

  const pad = n => String(n).padStart(4, '0');
  const fmt = p => parseFloat(p).toFixed(2).replace('.', ',') + ' €';

  let to, subject, html;

  if (type === 'new_order') {
    // Email à l'admin
    to = ADMIN_EMAIL;
    subject = `🌺 Nouvelle commande #${pad(order.num)} — ${fmt(order.total)}`;
    html = `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#f5f5f7;padding:20px">
        <div style="background:#000;border-radius:16px;padding:24px;margin-bottom:16px">
          <h1 style="color:white;font-size:24px;margin:0 0 4px">🌺 Poketime Rueil</h1>
          <p style="color:rgba(255,255,255,0.5);margin:0;font-size:14px">Nouvelle commande reçue</p>
        </div>
        <div style="background:white;border-radius:16px;padding:24px;margin-bottom:12px">
          <div style="font-size:13px;color:#86868b;margin-bottom:4px;text-transform:uppercase;letter-spacing:0.5px">Commande</div>
          <div style="font-size:32px;font-weight:800;color:#1d1d1f;letter-spacing:-1px">#${pad(order.num)}</div>
          <div style="margin-top:16px;padding-top:16px;border-top:1px solid #f0f0f0">
            <div style="font-size:13px;color:#86868b;margin-bottom:8px">CLIENT</div>
            <div style="font-weight:600">${order.customer_fname} ${order.customer_lname}</div>
            <div style="color:#6e6e73;font-size:14px">${order.customer_email}</div>
            <div style="color:#6e6e73;font-size:14px">${order.customer_phone}</div>
          </div>
          <div style="margin-top:16px;padding-top:16px;border-top:1px solid #f0f0f0">
            <div style="font-size:13px;color:#86868b;margin-bottom:8px">RÉCUPÉRATION</div>
            <div style="font-weight:700;font-size:18px">🕐 ${order.pickup_time}</div>
          </div>
          <div style="margin-top:16px;padding-top:16px;border-top:1px solid #f0f0f0">
            <div style="font-size:13px;color:#86868b;margin-bottom:8px">ARTICLES</div>
            ${(order.items||[]).map(i => `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f5f5f7"><span style="color:#1d1d1f">${i.name} ×${i.qty}</span><span style="font-weight:600">${fmt(i.price*i.qty)}</span></div>`).join('')}
            <div style="display:flex;justify-content:space-between;padding:12px 0;font-weight:700;font-size:16px"><span>Total</span><span>${fmt(order.total)}</span></div>
          </div>
          <div style="margin-top:8px;padding:10px 14px;border-radius:10px;font-size:13px;font-weight:600;${order.payment_status==='paid'?'background:#eaf6ed;color:#1d7a3e':'background:#fef3c7;color:#b45309'}">
            ${order.payment_status==='paid'?'💳 Payé par carte en ligne':'💵 Paiement en espèces à la récupération'}
          </div>
        </div>
        <div style="text-align:center;padding:12px;font-size:12px;color:#86868b">Poketime Rueil · Click & Collect</div>
      </div>`;

  } else if (type === 'preparing') {
    to = order.customer_email;
    subject = `🍳 Votre commande #${pad(order.num)} est en préparation !`;
    html = `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#f5f5f7;padding:20px">
        <div style="background:#000;border-radius:16px;padding:24px;margin-bottom:16px">
          <h1 style="color:white;font-size:24px;margin:0 0 4px">🌺 Poketime Rueil</h1>
          <p style="color:rgba(255,255,255,0.5);margin:0;font-size:14px">Mise à jour de votre commande</p>
        </div>
        <div style="background:white;border-radius:16px;padding:24px;margin-bottom:12px;text-align:center">
          <div style="font-size:48px;margin-bottom:12px">🍳</div>
          <h2 style="font-size:22px;font-weight:800;color:#1d1d1f;margin:0 0 8px">En cours de préparation !</h2>
          <p style="color:#6e6e73;margin:0 0 20px">Votre commande #${pad(order.num)} est en train d'être préparée par notre équipe.</p>
          <div style="background:#f5f5f7;border-radius:12px;padding:14px;font-weight:700;font-size:16px">🕐 Récupération prévue à ${order.pickup_time}</div>
        </div>
        <div style="text-align:center;padding:12px;font-size:12px;color:#86868b">Poketime Rueil · Rueil-Malmaison</div>
      </div>`;

  } else if (type === 'ready') {
    to = order.customer_email;
    subject = `✅ Votre commande #${pad(order.num)} est prête !`;
    html = `
      <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#f5f5f7;padding:20px">
        <div style="background:#000;border-radius:16px;padding:24px;margin-bottom:16px">
          <h1 style="color:white;font-size:24px;margin:0 0 4px">🌺 Poketime Rueil</h1>
          <p style="color:rgba(255,255,255,0.5);margin:0;font-size:14px">Votre commande est prête !</p>
        </div>
        <div style="background:white;border-radius:16px;padding:24px;margin-bottom:12px;text-align:center">
          <div style="font-size:48px;margin-bottom:12px">🎉</div>
          <h2 style="font-size:22px;font-weight:800;color:#1d1d1f;margin:0 0 8px">C'est prêt !</h2>
          <p style="color:#6e6e73;margin:0 0 20px">Votre commande #${pad(order.num)} vous attend en boutique. Venez la récupérer !</p>
          <div style="background:#eaf6ed;border-radius:12px;padding:14px;font-weight:700;font-size:16px;color:#1d7a3e">🌺 Commande prête à emporter</div>
          <div style="margin-top:12px;background:#f5f5f7;border-radius:12px;padding:14px;font-size:14px;color:#6e6e73">Poketime Rueil · Rueil-Malmaison</div>
        </div>
        <div style="text-align:center;padding:12px;font-size:12px;color:#86868b">Poketime Rueil · Click & Collect</div>
      </div>`;
  }

  // Email custom
  if (type === 'custom') {
    to = order.customer_email;
    subject = order.custom_subject;
    html = `<div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;padding:20px">
      <div style="background:#111;border-radius:16px;padding:24px;margin-bottom:16px">
        <h1 style="color:white;font-size:22px;margin:0">🌺 Poketime Rueil</h1>
      </div>
      <div style="background:white;border-radius:16px;padding:24px;border:1px solid #e5e5e5">
        <p style="color:#444;font-size:15px;line-height:1.7;white-space:pre-wrap">${order.custom_body}</p>
      </div>
      <div style="text-align:center;padding:12px;font-size:12px;color:#888">Poketime Rueil · Rueil-Malmaison</div>
    </div>`;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_KEY}`
      },
      body: JSON.stringify({
        from: 'Poketime Rueil <onboarding@resend.dev>',
        to: [to],
        subject,
        html
      })
    });

    const data = await response.json();
    console.log('Resend response:', JSON.stringify(data));
    return res.status(200).json({ success: true, data });

  } catch (error) {
    console.error('Email error:', error);
    return res.status(500).json({ error: error.message });
  }
}
