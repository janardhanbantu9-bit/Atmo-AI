export const config = { api: { bodyParser: false } };
import OpenAI, { toFile } from "openai";

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

  const chunks = await new Promise((resolve, reject) => {
    const received = [];
    req.on("data", (chunk) => received.push(Buffer.from(chunk)));
    req.on("end", () => resolve(received));
    req.on("error", reject);
  });
  const contentType = req.headers["content-type"] || "application/octet-stream";
  const body = Buffer.concat(chunks);
  if (!body.length) {
    res.status(400).json({ error: "Audio data is required." });
    return;
  }

  const language = req.headers["x-atmo-language"];
  const extension = contentType.includes("ogg") ? "ogg" : contentType.includes("mp4") ? "mp4" : "webm";
  let data;
  try {
    data = await groq.audio.transcriptions.create({
      file: await toFile(body, `atmo-recording.${extension}`, { type: contentType }),
      model: "whisper-large-v3",
      response_format: "json",
      temperature: 0,
      ...(language && language !== "auto" ? { language } : {}),
    });
  } catch (error) {
    res.status(error.status || 502).json({ error: error.message || "Speech transcription failed." });
    return;
  }

  res.status(200).json({ text: data?.text || "" });
}
