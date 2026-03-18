// netlify/functions/verify-license.js
// Netlify serverless function — proxies Gumroad license verification.

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let license_key;
  try {
    const parsed = JSON.parse(event.body || "{}");
    license_key = parsed.license_key;
  } catch {
    return { statusCode: 400, body: JSON.stringify({ valid: false, error: "Invalid request" }) };
  }

  if (!license_key || typeof license_key !== "string") {
    return { statusCode: 400, body: JSON.stringify({ valid: false, error: "No license key provided" }) };
  }

  const productId = process.env.GUMROAD_PRODUCT_ID;
  if (!productId) {
    return { statusCode: 500, body: JSON.stringify({ valid: false, error: "Server configuration error" }) };
  }

  try {
    const body = new URLSearchParams({
      product_id: productId,
      license_key: license_key.trim(),
      increment_uses_count: "false",
    });

    const gumroadRes = await fetch("https://api.gumroad.com/v2/licenses/verify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    const data = await gumroadRes.json();

    if (!data.success) {
      return { statusCode: 200, body: JSON.stringify({ valid: false, error: data.message || "Invalid key" }) };
    }

    const p = data.purchase;
    if (p.refunded || p.disputed || p.chargebacked) {
      return { statusCode: 200, body: JSON.stringify({ valid: false, error: "This license is no longer active" }) };
    }

    return { statusCode: 200, body: JSON.stringify({ valid: true, email: p.email, order: p.order_number }) };

  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ valid: false, error: "Verification failed — try again" }) };
  }
}
