import { checkLicense } from "../../lib/gumroad";

// Protección básica contra abuso de créditos de Anthropic.
const WINDOW_MS = 60 * 60 * 1000; // ventana de 1 hora
const LIMIT_FREE = 20; // peticiones por hora por IP sin Premium
const LIMIT_PREMIUM = 100; // peticiones por hora por IP con Premium verificado
const MAX_PROMPT_CHARS = 4000; // tamaño máximo del prompt
const MAX_TOKENS = 500; // las lecturas son de ~180 palabras

// Contador en memoria: es "mejor esfuerzo" (se reinicia cuando Vercel
// apaga la instancia), pero frena el abuso más común.
const hits = new Map();

function tooMany(ip, limit) {
  const now = Date.now();
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (now - v.start > WINDOW_MS) hits.delete(k);
    }
  }
  const entry = hits.get(ip);
  if (!entry || now - entry.start > WINDOW_MS) {
    hits.set(ip, { start: now, n: 1 });
    return false;
  }
  entry.n += 1;
  return entry.n > limit;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt, licenseKey } = req.body || {};
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Missing prompt" });
  }
  if (prompt.length > MAX_PROMPT_CHARS) {
    return res.status(413).json({ error: "Prompt too long" });
  }

  // Premium verificado = límite más alto. Sin clave o con clave inválida = límite normal.
  let premium = false;
  if (typeof licenseKey === "string" && licenseKey.trim()) {
    try {
      const result = await checkLicense(licenseKey);
      premium = result && result.premium === true;
    } catch {
      premium = false;
    }
  }

  const ip =
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.socket?.remoteAddress ||
    "unknown";

  if (tooMany(ip, premium ? LIMIT_PREMIUM : LIMIT_FREE)) {
    return res.status(429).json({ error: "Too many requests" });
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: MAX_TOKENS,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", errText);
      return res.status(502).json({ error: "Upstream API error" });
    }

    const data = await response.json();
    const text = data.content?.map((b) => b.text || "").join("") || "";
    return res.status(200).json({ text });
  } catch (err) {
    console.error("Interpret handler error:", err);
    return res.status(500).json({ error: "Internal error" });
  }
}
