const RESEND_ENDPOINT = "https://api.resend.com/emails";

function formatItems(items = []) {
  return items
    .map((it) => {
      const variant = [it.color, it.size].filter(Boolean).join(", ");
      const label = variant ? `${it.name} (${variant})` : it.name;
      return `  • ${label} x${it.qty} — KES ${(it.price * it.qty).toLocaleString()}`;
    })
    .join("\n");
}

export async function sendPaymentReceivedEmail(order, paymentData) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ADMIN_EMAIL;
  const from = process.env.NOTIFICATION_FROM || "Wangaré Luxe <onboarding@resend.dev>";

  if (!apiKey || !to) {
    console.warn("[notifications] RESEND_API_KEY or ADMIN_EMAIL not set — skipping email");
    return { skipped: true };
  }

  const orderRef = `#${String(order.id).padStart(4, "0")}`;
  const customer = order.customer || {};
  const subject = `💰 Payment received — Order ${orderRef} (KES ${order.total?.toLocaleString()})`;

  const text =
    `Payment received for Order ${orderRef}\n\n` +
    `Customer: ${customer.name || "—"}\n` +
    `Phone: ${customer.phone || "—"}\n` +
    `Email: ${customer.email || "—"}\n` +
    `Delivery: ${customer.location || "—"}\n\n` +
    `Items:\n${formatItems(order.items)}\n\n` +
    `Total: KES ${order.total?.toLocaleString()}\n` +
    `Payment method: ${paymentData?.payment_method || order.pesapalPaymentMethod || "—"}\n` +
    `Pesapal reference: ${order.pesapalMerchantReference || "—"}\n\n` +
    `Manage this order: https://wangare-luxe.netlify.app/admin/orders\n`;

  const html = `
<div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #1C1C1E;">
  <div style="background: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
    <p style="margin: 0; color: #065F46; font-weight: 600; font-size: 14px;">💰 Payment Received</p>
    <p style="margin: 4px 0 0; color: #047857; font-size: 13px;">Order ${orderRef} • KES ${order.total?.toLocaleString()}</p>
  </div>
  <h2 style="margin: 0 0 12px; font-size: 18px;">Customer</h2>
  <p style="margin: 4px 0; font-size: 14px;"><strong>${escape(customer.name || "—")}</strong></p>
  <p style="margin: 4px 0; font-size: 13px; color: #555;">📞 ${escape(customer.phone || "—")}</p>
  <p style="margin: 4px 0; font-size: 13px; color: #555;">✉️ ${escape(customer.email || "—")}</p>
  <p style="margin: 4px 0; font-size: 13px; color: #555;">📍 ${escape(customer.location || "—")}</p>
  <h2 style="margin: 20px 0 12px; font-size: 18px;">Items</h2>
  <ul style="margin: 0; padding-left: 18px; font-size: 14px;">
    ${(order.items || []).map((it) => {
      const variant = [it.color, it.size].filter(Boolean).join(", ");
      const label = variant ? `${escape(it.name)} (${escape(variant)})` : escape(it.name);
      return `<li style="margin-bottom: 4px;">${label} × ${it.qty} — <strong>KES ${(it.price * it.qty).toLocaleString()}</strong></li>`;
    }).join("")}
  </ul>
  <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #E5E7EB;">
    <p style="margin: 4px 0; font-size: 13px; color: #555;">Payment method: <strong>${escape(paymentData?.payment_method || order.pesapalPaymentMethod || "—")}</strong></p>
    <p style="margin: 4px 0; font-size: 13px; color: #555;">Pesapal ref: <code>${escape(order.pesapalMerchantReference || "—")}</code></p>
  </div>
  <a href="https://wangare-luxe.netlify.app/admin/orders" style="display: inline-block; margin-top: 20px; background: #1C1C1E; color: #fff; padding: 10px 18px; border-radius: 8px; font-size: 14px; text-decoration: none;">Open Admin Dashboard</a>
</div>`;

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [to], subject, text, html }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error("[notifications] Resend send failed", res.status, body);
      return { ok: false, status: res.status };
    }
    return { ok: true };
  } catch (err) {
    console.error("[notifications] Resend request error", err);
    return { ok: false, error: String(err) };
  }
}

function escape(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}
