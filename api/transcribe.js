export const config = { api: { bodyParser: false } };

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

  const chunks = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  const contentType = req.headers["content-type"] || "application/octet-stream";
  const body = Buffer.concat(chunks);

  const form = new FormData();
  const language = req.headers["x-atmo-language"];
  form.append("file", new Blob([body], { type: contentType }), "atmo-recording.webm");
  form.append("model", "whisper-large-v3");
  form.append("response_format", "json");
  form.append("temperature", "0");
  if (language && language !== "auto") form.append("language", language);

  const response = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    res.status(response.status).json({ error: data?.error?.message || "Speech transcription failed." });
    return;
  }

  res.status(200).json({ text: data?.text || "" });
}
