import { checkLicense } from "../../lib/gumroad";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ premium: false, reason: "method" });
  }
  const { licenseKey } = req.body || {};
  const result = await checkLicense(licenseKey);
  // Solo devolvemos si es premium y el motivo; nunca datos de la compra.
  return res.status(200).json(result);
}
