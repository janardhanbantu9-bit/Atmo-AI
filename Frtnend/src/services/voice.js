(function () {
  let activeRecorder = null;
  let activeStream = null;
  let chunks = [];
  let wrappedSendMessage = false;

  async function recordAndTranscribe(language = "auto") {
    if (activeRecorder) throw new Error("Already recording.");
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      throw new Error("Voice recording is not supported in this browser.");
    }

    activeStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeTypes = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus"];
    const mimeType = mimeTypes.find((type) => MediaRecorder.isTypeSupported(type)) || "";
    activeRecorder = new MediaRecorder(activeStream, mimeType ? { mimeType } : undefined);
    chunks = [];

    const result = new Promise((resolve, reject) => {
      activeRecorder.ondataavailable = (event) => {
        if (event.data?.size) chunks.push(event.data);
      };
      activeRecorder.onerror = () => reject(new Error("Voice recording failed."));
      activeRecorder.onstop = async () => {
        try {
          const blob = new Blob(chunks, { type: activeRecorder.mimeType || "audio/webm" });
          const response = await fetch("/api/transcribe", {
            method: "POST",
            headers: { "Content-Type": blob.type, "X-Atmo-Language": language },
            body: blob,
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(data.error || "Speech transcription failed.");
          resolve(data.text || "");
        } catch (error) {
          reject(error);
        } finally {
          activeStream?.getTracks().forEach((track) => track.stop());
          activeStream = null;
          activeRecorder = null;
          chunks = [];
        }
      };
      activeRecorder.start();
    });

    return result;
  }

  function stopRecording() {
    if (activeRecorder && activeRecorder.state !== "inactive") activeRecorder.stop();
  }

  async function speak(text, mode = "english") {
    const response = await fetch("/api/speak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, mode }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Text-to-speech failed.");

    const bytes = Uint8Array.from(atob(data.audio), (char) => char.charCodeAt(0));
    const blob = new Blob([bytes], { type: data.mimeType || "audio/wav" });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.onended = () => URL.revokeObjectURL(url);
    await audio.play();
  }

  function wrapSendMessageForLanguage() {
    if (wrappedSendMessage || typeof window.sendMessage !== "function") return;
    const original = window.sendMessage;
    window.sendMessage = function (text, domain, location) {
      const language = window.__ATMO_RESPONSE_LANGUAGE__ || "auto";
      if (language && language !== "auto") {
        return original(
          `${text}\n\nRespond in ${language}. Keep the answer concise and natural.`,
          domain,
          location
        );
      }
      return original(text, domain, location);
    };
    wrappedSendMessage = true;
  }

  function install() {
    window.AtmoVoice = { recordAndTranscribe, stopRecording, speak };
    wrapSendMessageForLanguage();
    if (!wrappedSendMessage) window.setTimeout(wrapSendMessageForLanguage, 150);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install, { once: true });
  } else {
    install();
  }
}());
