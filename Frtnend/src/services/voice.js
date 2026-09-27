(function () {
  let activeRecorder = null;
  let activeStream = null;
  let chunks = [];

  async function recordAndTranscribe(language = "auto", onRecordingStart = () => {}) {
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
      onRecordingStart();
    });

    return result;
  }

  function stopRecording() {
    if (activeRecorder && activeRecorder.state !== "inactive") activeRecorder.stop();
  }

  function isRecording() {
    return Boolean(activeRecorder && activeRecorder.state !== "inactive");
  }

  async function speak(text, mode = "english") {
    const response = await fetch("/api/speak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, mode }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      if ("speechSynthesis" in window && "SpeechSynthesisUtterance" in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = ({ english: "en-US", arabic: "ar-SA", Hindi: "hi-IN", Telugu: "te-IN", Spanish: "es-ES", French: "fr-FR", German: "de-DE", Portuguese: "pt-BR", Japanese: "ja-JP", Korean: "ko-KR", Chinese: "zh-CN", Urdu: "ur-PK", Bengali: "bn-IN" })[mode] || "en-US";
        await new Promise((resolve, reject) => {
          utterance.onend = resolve;
          utterance.onerror = () => reject(new Error(data.error || "Text-to-speech failed."));
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(utterance);
        });
        return { fallback: true };
      }
      throw new Error(data.error || "Text-to-speech failed.");
    }

    const bytes = Uint8Array.from(atob(data.audio), (char) => char.charCodeAt(0));
    const blob = new Blob([bytes], { type: data.mimeType || "audio/wav" });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    await new Promise((resolve, reject) => {
      audio.onended = () => { URL.revokeObjectURL(url); resolve(); };
      audio.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Audio playback failed.")); };
      audio.play().catch((error) => { URL.revokeObjectURL(url); reject(error); });
    });
    return { fallback: false };
  }

  function install() {
    window.AtmoVoice = { recordAndTranscribe, stopRecording, isRecording, speak };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", install, { once: true });
  } else {
    install();
  }
}());
