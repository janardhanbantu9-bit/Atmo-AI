import OpenAI from "openai";

const groq = new OpenAI({ apiKey: process.env.GROQ_API_KEY, baseURL: "https://api.groq.com/openai/v1" });

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
  if (!models[mode]) {
    res.status(501).json({ error: `Orpheus speech is not configured for ${mode}.` });
    return;
  }
  const selected = models[mode] || models.english;
  const input = text.replace(/\s+/g, " ").trim().slice(0, 200);
  if (!input) {
    res.status(400).json({ error: "Text is empty." });
    return;
  }

  let audio;
  try {
    audio = await groq.audio.speech.create({
      model: selected.model,
      voice: selected.voice,
      input,
      response_format: "wav",
    });
  } catch (error) {
    res.status(error.status || 502).json({ error: error.message || "Speech synthesis failed." });
    return;
  }

  const buffer = Buffer.from(await audio.arrayBuffer());
  res.status(200).json({
    audio: buffer.toString("base64"),
    mimeType: "audio/wav",
  });
}
