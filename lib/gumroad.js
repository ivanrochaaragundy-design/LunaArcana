// Verifica una clave de licencia contra la API de Gumroad.
// Requiere la variable de entorno GUMROAD_PRODUCT_ID (solo en Vercel, nunca en el código).
export async function checkLicense(licenseKey) {
  if (!licenseKey || typeof licenseKey !== "string" || licenseKey.length > 100) {
    return { premium: false, reason: "invalid" };
  }

  try {
    const body = new URLSearchParams({
      product_id: process.env.GUMROAD_PRODUCT_ID || "",
      license_key: licenseKey.trim(),
      increment_uses_count: "false", // no inflar el contador de usos en cada verificación
    });

    const res = await fetch("https://api.gumroad.com/v2/licenses/verify", {
      method: "POST",
      body,
    });
    const data = await res.json().catch(() => null);

    if (!data || !data.success) return { premium: false, reason: "invalid" };

    const p = data.purchase || {};
    if (p.refunded || p.chargebacked) return { premium: false, reason: "refunded" };
    if (p.subscription_ended_at || p.subscription_failed_at) return { premium: false, reason: "expired" };
    // Si prefieres que quien cancele conserve acceso hasta fin de período,
    // borra la siguiente línea y deja que decida subscription_ended_at.
    if (p.subscription_cancelled_at) return { premium: false, reason: "cancelled" };

    return { premium: true };
  } catch {
    // Fallo de red: no sabemos. El cliente decide qué hacer con "error".
    return { premium: false, reason: "error" };
  }
}
