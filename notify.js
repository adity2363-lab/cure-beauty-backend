// Sends an email to the shop owner whenever a new order comes in.
// Uses Resend (resend.com) — free tier, no credit card needed.
// Set RESEND_API_KEY and ADMIN_EMAIL as environment variables on Render for this to work.
// If they aren't set, this silently does nothing so orders still succeed.

async function notifyNewOrder({ orderId, customerName, customerPhone, total, items, address }) {
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!apiKey || !adminEmail) {
    console.log(`[Notify] Skipped email (RESEND_API_KEY / ADMIN_EMAIL not set). New order #${orderId} from ${customerName}.`);
    return;
  }

  const itemLines = items.map((it) => `- ${it.name} x${it.quantity} (₹${it.price} each)`).join("\n");
  const addressText = address ? `${address.line}, ${address.city} - ${address.pincode}` : "No address on file";

  const body = {
    from: "Cure Beauty <onboarding@resend.dev>", // Resend's default sending address until you verify your own domain
    to: [adminEmail],
    subject: `New order #${orderId} — ₹${total}`,
    text: `New order received!\n\nOrder #${orderId}\nCustomer: ${customerName} (${customerPhone})\nAddress: ${addressText}\n\nItems:\n${itemLines}\n\nTotal: ₹${total}`,
  };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) console.error("[Notify] Email failed:", await res.text());
  } catch (e) {
    console.error("[Notify] Email error:", e.message);
  }
}

module.exports = { notifyNewOrder };
