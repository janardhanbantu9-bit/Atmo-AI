import { askGroq } from "../backend/services/groqServices.js";

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
    const body = req.body || {};

    if (!body.message || typeof body.message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    const domain =
      typeof body.domain === "string" && body.domain.trim()
        ? body.domain.trim()
        : "research";

    const location = body.location && typeof body.location === "object"
      ? body.location
      : null;

    const language = typeof body.language === "string" ? body.language : "auto";
    const reply = await askGroq(body.message, { domain, location, language });

    return res.status(200).json({ reply });
  } catch (error) {
    console.error("Groq API error:", error);

    return res.status(500).json({ error: error instanceof Error ? error.message : "Failed to contact Groq" });
  }
}
