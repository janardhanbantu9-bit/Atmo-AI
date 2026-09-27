export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "GROQ_API_KEY is not configured." });
    return;
  }

  const { text, mode = "english" } = req.body || {};
  if (!text || typeof text !== "string") {
    res.status(400).json({ error: "Text is required." });
    return;
  }

  const models = {
    english: { model: "canopylabs/orpheus-v1-english", voice: "hannah" },
    arabic: { model: "canopylabs/orpheus-arabic-saudi", voice: "noura" },
  };
  const selected = models[mode] || models.english;
  const input = text.replace(/\s+/g, " ").trim().slice(0, 200);
  if (!input) {
    res.status(400).json({ error: "Text is empty." });
    return;
  }

  const response = await fetch("https://api.groq.com/openai/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: selected.model,
      voice: selected.voice,
      input,
      response_format: "wav",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    res.status(response.status).json({ error: errorText || "Speech synthesis failed." });
    return;
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  res.status(200).json({
    audio: buffer.toString("base64"),
    mimeType: "audio/wav",
  });
}
