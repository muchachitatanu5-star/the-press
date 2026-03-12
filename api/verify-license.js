// api/verify-license.js
// Vercel serverless function — proxies Gumroad license verification.
// Keeps your Gumroad product_id out of the browser.
//
// Set this environment variable in Vercel dashboard:
//   GUMROAD_PRODUCT_ID  →  the product_id from your Gumroad license key module
//   (expand the license key block on your product's content page to find it)

export default async function handler(req, res) {
  // Only POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { license_key } = req.body || {};

  if (!license_key || typeof license_key !== "string") {
    return res.status(400).json({ valid: false, error: "No license key provided" });
  }

  const productId = process.env.GUMROAD_PRODUCT_ID;
  if (!productId) {
    console.error("GUMROAD_PRODUCT_ID environment variable is not set");
    return res.status(500).json({ valid: false, error: "Server configuration error" });
  }

  try {
    const body = new URLSearchParams({
      product_id: productId,
      license_key: license_key.trim(),
      increment_uses_count: "false", // don't count validation as a "use"
    });

    const gumroadRes = await fetch("https://api.gumroad.com/v2/licenses/verify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    const data = await gumroadRes.json();

    if (!data.success) {
      return res.status(200).json({ valid: false, error: data.message || "Invalid key" });
    }

    // Reject refunded or disputed purchases
    const p = data.purchase;
    if (p.refunded || p.disputed || p.chargebacked) {
      return res.status(200).json({ valid: false, error: "This license is no longer active" });
    }

    // All good
    return res.status(200).json({
      valid: true,
      email: p.email,        // optional — app can show "Welcome back, user@x.com"
      order: p.order_number,
    });

  } catch (err) {
    console.error("Gumroad verification error:", err);
    return res.status(500).json({ valid: false, error: "Verification failed — try again" });
  }
}
