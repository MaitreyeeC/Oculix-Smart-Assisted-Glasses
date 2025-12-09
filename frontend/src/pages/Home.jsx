import { useSettings } from "../context/SettingsContext";
import useKeyboardShortcuts from "../hooks/useKeyboardShortcuts";
import React, { useRef, useState, useEffect } from "react";
import axios from "axios";


const BACKEND_URL = "http://127.0.0.1:8000";

const MODES = {
  SCENE: "scene",
  OBJECTS: "objects",
  TEXT: "text",
  CURRENCY: "currency",
  DOCUMENT: "document",
  FALL: "fall",
};

function Home() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const recognitionRef = useRef(null);

  const [output, setOutput] = useState("Point the camera and choose a mode.");
  const [loading, setLoading] = useState(false);
  const [activeMode, setActiveMode] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const {
  voiceEnabled,
  setVoiceEnabled,
  voiceSpeed,
  setVoiceSpeed,
  voiceGender,
  setVoiceGender,
  voiceVolume,
  setVoiceVolume,
  contrastMode,
  setContrastMode,
  cameraSource,
  setCameraSource,
  activityLog,
  setActivityLog,
} = useSettings();

    const pageStyle = {
  minHeight: "100vh",
  background: contrastMode === "high"
    ? "black"
    : "radial-gradient(circle at top left, #ffe4f1 0, #ffd7ef 36%, #fdf2ff 70%, #ffe4f1 100%)",
  color: contrastMode === "high" ? "yellow" : "#4a044e",
  fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  padding: "16px 24px",
  boxSizing: "border-box",
};



  // ---------- helper: speak out loud ----------
  const speak = (text) => {
    if (!voiceEnabled) return;
    if (typeof window === "undefined") return;
    if (!("speechSynthesis" in window)) return;
    if (isListening) return; // ❗ don't speak while listening

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-IN";
      utterance.rate = voiceSpeed;
      utterance.volume = voiceVolume;
      utterance.pitch = voiceGender === "female" ? 1.2 : 0.7;

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("Speech error:", e);
    }
  };

  // Keyboard Shortcuts Handler
const handleKeyPress = (e) => {
  const key = e.key.toLowerCase();

  // Space → repeat output
  if (key === " ") {
    speak(output);
  }

  // V → Toggle Voice
  if (key === "v") {
    setVoiceEnabled(prev => !prev);
    speak(`Voice ${!voiceEnabled ? "Enabled" : "Disabled"}`);
  }

  // 1–6 → switch modes
  const modeNumbers = {
    "1": MODES.SCENE,
    "2": MODES.OBJECTS,
    "3": MODES.TEXT,
    "4": MODES.CURRENCY,
    "5": MODES.DOCUMENT,
    "6": MODES.FALL,
  };

  if (modeNumbers[key]) {
    handleModeClick(modeNumbers[key]);
  }
};


  // ---------- camera ----------
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        const msg = "Cannot access camera. Please allow camera permissions.";
        setOutput(msg);
        speak(msg);
      }
    }
    startCamera();
  }, []);

  useEffect(() => {
  const saved = JSON.parse(localStorage.getItem("oculix-activity")) || [];
  setActivityLog(saved);
}, []);

  // ---------- speech recognition (voice commands) ----------
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      const msg =
        "Listening. Say a mode like describe scene, detect objects, read text, currency, read document, or fall detection.";
      setOutput(msg);
      // ⚠️ don't speak here, or it will kill the mic
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
      const msg = "Sorry, I could not hear properly. Please try again.";
      setOutput(msg);
      speak(msg);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase().trim();
      console.log("Heard:", transcript);
      handleVoiceCommand(transcript);
    };

    recognitionRef.current = recognition;
  }, []);

  // Attach keyboard listener
  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
}, [output, voiceEnabled]);


  const toggleListening = () => {
    if (!speechSupported) return;
    const recognition = recognitionRef.current;
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
    } else {
      // stop any current speech before listening
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      recognition.start();
    }
  };

  const handleVoiceCommand = (text) => {
    let mode = null;

    if (text.includes("describe") || text.includes("scene")) {
      mode = MODES.SCENE;
    } else if (text.includes("object")) {
      mode = MODES.OBJECTS;
    } else if (text.includes("simple text") || text.includes("read text") || text.includes("text")) {
      mode = MODES.TEXT;
    } else if (text.includes("currency") || text.includes("money") || text.includes("note")) {
      mode = MODES.CURRENCY;
    } else if (text.includes("document")) {
      mode = MODES.DOCUMENT;
    } else if (text.includes("fall")) {
      mode = MODES.FALL;
    }

    if (mode) {
      const msg = `Heard: ${text}. Switching to ${prettyModeName(mode)} mode.`;
      setOutput(msg);
      speak(msg);
      handleModeClick(mode, true);
    } else {
      const msg = `Heard: ${text}, but I could not match it to a mode. Try: describe scene, detect objects, currency, read document, or fall detection.`;
      setOutput(msg);
      speak(msg);
    }
  };

  const prettyModeName = (mode) => {
    switch (mode) {
      case MODES.SCENE:
        return "Describe Scene";
      case MODES.OBJECTS:
        return "Detect Object";
      case MODES.TEXT:
        return "Read Simple Text";
      case MODES.CURRENCY:
        return "Currency";
      case MODES.DOCUMENT:
        return "Read Document";
      case MODES.FALL:
        return "Fall Detection";
      default:
        return "Unknown";
    }
  };

  const captureFrameAsBlob = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return null;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.9);
    });
  };

  const saveLog = async (modeName, message) => {
  const log = {
    mode: modeName,
    message,
    time: new Date().toLocaleTimeString(),
  };

  try {
    await axios.post(`${BACKEND_URL}/activity/add`, null, {
      params: log,
    });
  } catch (err) {
    console.error("Error saving log:", err);
  }

  setActivityLog((prev) => [log, ...prev]);
};


  const handleModeClick = async (mode, fromVoice = false) => { 
  setActiveMode(mode);
  setLoading(true);

  try {
    // FALL: just call /fall-detection (no image)
    if (mode === MODES.FALL) {
      const res = await axios.get(`${BACKEND_URL}/fall-detection`);
      const data = res.data;
      const msg = data.fall_detected
        ? `Alert. Fall detected. ${data.message}`
        : data.message || "No fall detected recently.";
      setOutput("🧍‍♀️ " + msg);
      speak(msg);
      saveLog("Fall Detection", msg);
      return;
    }

    // OTHER MODES: need an image
    const blob = await captureFrameAsBlob();
    if (!blob) {
      const msg = "Could not capture image from camera.";
      setOutput(msg);
      speak(msg);
      return;
    }

    const formData = new FormData();
    formData.append("file", blob, "frame.jpg");

    let endpoint = "";
    if (mode === MODES.SCENE) endpoint = "describe-scene";
    if (mode === MODES.OBJECTS) endpoint = "detect-objects";
    if (mode === MODES.TEXT) endpoint = "read-text";
    if (mode === MODES.CURRENCY) endpoint = "currency";
    if (mode === MODES.DOCUMENT) endpoint = "read-document";

    const res = await axios.post(`${BACKEND_URL}/${endpoint}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (mode === MODES.SCENE) {
      const desc = res.data.description || "No description available.";
      setOutput("👁️ " + desc);
      speak(desc);
      saveLog("Describe Scene", desc);
    } 
    else if (mode === MODES.OBJECTS) {
      const data = res.data;
      let msg = "";
      if (!data || data.length === 0) {
        msg = "No objects detected.";
      } else {
        const txt = data
          .map((d) => `${d.label} ${Math.round(d.confidence * 100)} percent`)
          .join(", ");
        msg = "Detected: " + txt;
      }
      setOutput("📦 " + msg);
      speak(msg);
      saveLog("Detect Object", msg);
    } 
    else if (mode === MODES.TEXT) {
      const data = res.data;
      let msg = "";
      if (!data || data.length === 0) {
        msg = "No readable text found.";
      } else {
        const txt = data.map((d) => d.text).join(" . ");
        msg = "Text reads: " + txt;
      }
      setOutput("🔤 " + msg);
      speak(msg);
      saveLog("Read Text", msg);
    } 
    else if (mode === MODES.CURRENCY) {
      const { result, lines } = res.data;
      const ocr = lines && lines.length > 0 ? ` OCR: ${lines.join(" . ")}` : "";
      const msg = result || "I could not identify the currency.";
      setOutput("💸 " + msg + ocr);
      speak(msg);
      saveLog("Currency", msg);
    } 
    else if (mode === MODES.DOCUMENT) {
      const { full_text, message } = res.data;
      const msg = full_text || message || "No document text detected.";
      setOutput("📄 " + msg);
      speak(msg);
      saveLog("Read Document", msg);
    }

  } catch (err) {
    console.error(err);
    const msg = "Error talking to the AI server.";
    setOutput(msg + " " + err.message);
    speak(msg);
  } finally {
    setLoading(false);
  }
};

  useKeyboardShortcuts({
    repeatOutput: () => speak(output),
    toggleVoice: () => setVoiceEnabled(prev => !prev),
    changeMode: (num) => {
     const modesArray = [
        "scene",
        "objects",
        "text",
        "currency",
        "document",
        "fall"
    ];
    handleModeClick(modesArray[num - 1]);
  }
});

  return (
    <div style={pageStyle}>
      {/* Top bar */}
      <header style={headerStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={logoDot}></span>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontWeight: 600, fontSize: "14px", color: "#4a044e" }}>
              Oculix Seeing AI
            </span>
            <span style={{ fontSize: "11px", color: "#7e255e" }}>
              Built by Maitreyee and Yash
            </span>
          </div>
        </div>

        <div style={headerRightStyle}>
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            style={voiceToggleStyle(voiceEnabled)}
          >
            <span>{voiceEnabled ? "🔊" : "🔇"}</span>
            <span style={{ fontSize: "11px" }}>
              {voiceEnabled ? "Voice On" : "Voice Off"}
            </span>
          </button>

          {speechSupported ? (
            <button
              onClick={toggleListening}
              style={micButtonStyle(isListening)}
            >
              <span style={{ fontSize: "14px" }}>🎙️</span>
              <span style={{ fontSize: "11px" }}>
                {isListening ? "Listening…" : "Voice Command"}
              </span>
            </button>
          ) : (
            <span style={{ fontSize: "11px", color: "#7e255e" }}>
              Voice control not supported in this browser.
            </span>
          )}
        </div>
      </header>

      {/* Main content */}
      <main style={mainStyle}>
        {/* Left: video */}
        <section style={leftPanelStyle}>
          <h2 style={panelTitleStyle}>Live Camera</h2>
          <video
            ref={videoRef}
            autoPlay
            style={videoStyle}
            playsInline
          ></video>
          <canvas ref={canvasRef} style={{ display: "none" }} />
          <p style={hintTextStyle}>
            Allow camera access in your browser settings. Position the device so
            that the subject is centered.
          </p>
        </section>

        {/* Right: controls & output */}
        <section style={rightPanelStyle}>
          <h2 style={panelTitleStyle}>Modes</h2>

          <div style={modesGridStyle}>
            <ModeButton
              label="Describe Scene"
              active={activeMode === MODES.SCENE}
              loading={loading}
              onClick={() => handleModeClick(MODES.SCENE)}
            />
            <ModeButton
              label="Detect Object"
              active={activeMode === MODES.OBJECTS}
              loading={loading}
              onClick={() => handleModeClick(MODES.OBJECTS)}
            />
            <ModeButton
              label="Read Simple Text"
              active={activeMode === MODES.TEXT}
              loading={loading}
              onClick={() => handleModeClick(MODES.TEXT)}
            />
            <ModeButton
              label="Currency"
              active={activeMode === MODES.CURRENCY}
              loading={loading}
              onClick={() => handleModeClick(MODES.CURRENCY)}
            />
            <ModeButton
              label="Read Document"
              active={activeMode === MODES.DOCUMENT}
              loading={loading}
              onClick={() => handleModeClick(MODES.DOCUMENT)}
            />
            <ModeButton
              label="Fall Detection"
              active={activeMode === MODES.FALL}
              loading={loading}
              onClick={() => handleModeClick(MODES.FALL)}
            />
          </div>

          <div style={outputCardStyle}>
            <div style={{ fontSize: "12px", opacity: 0.7, marginBottom: "6px" }}>
              Output
            </div>
            <div
              style={{
                fontSize: "14px",
                lineHeight: 1.5,
                whiteSpace: "pre-wrap",
                color: "#4a044e",
              }}
            >
              {loading ? "Processing…" : output}
            </div>
          </div>

          <div style={footerNoteStyle}>
            All modes call a FastAPI backend and speak the results aloud,
            designed for blind and low-vision users.
          </div>
        </section>
      </main>
    </div>
  );
}

/* ---------- Reusable components & styles ---------- */

function ModeButton({ label, emoji, active, loading, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      style={modeButtonStyle(active, loading)}
    >
      <span style={{ fontSize: "16px" }}>{emoji}</span>
      <span style={{ fontSize: "12px" }}>
        {loading && active ? "Working…" : label}
      </span>
    </button>
  );
}


const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "16px",
  fontSize: "14px",
};

const headerRightStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const logoDot = {
  width: "12px",
  height: "12px",
  borderRadius: "999px",
  background:
    "radial-gradient(circle at 30% 30%, #fdf2ff 0, #f472b6 35%, #be185d 100%)",
  boxShadow: "0 0 14px rgba(244,114,182,0.9)",
};

const mainStyle = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 3fr) minmax(0, 2.4fr)",
  gap: "20px",
  alignItems: "flex-start",
};

const leftPanelStyle = {
  background: "rgba(255, 240, 246, 0.85)",
  borderRadius: "20px",
  padding: "14px",
  border: "1px solid rgba(244, 114, 182, 0.3)",
  boxShadow: "0 18px 40px rgba(244, 114, 182, 0.2)",
};

const rightPanelStyle = {
  background: "rgba(255, 240, 246, 0.9)",
  borderRadius: "20px",
  padding: "14px",
  border: "1px solid rgba(244, 114, 182, 0.35)",
  boxShadow: "0 18px 40px rgba(244, 114, 182, 0.25)",
  display: "flex",
  flexDirection: "column",
  gap: "14px",
};

const panelTitleStyle = {
  fontSize: "13px",
  fontWeight: 700,
  marginBottom: "10px",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#7e255e",
};

const videoStyle = {
  width: "100%",
  borderRadius: "16px",
  border: "1px solid rgba(244, 114, 182, 0.6)",
  backgroundColor: "#000",
  boxShadow: "0 10px 30px rgba(190, 24, 93, 0.35)",
};

const hintTextStyle = {
  fontSize: "11px",
  opacity: 0.7,
  marginTop: "8px",
};

const modesGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "10px",
};

const outputCardStyle = {
  marginTop: "10px",
  padding: "12px",
  borderRadius: "16px",
  background:
    "linear-gradient(135deg, rgba(255, 241, 246, 1), rgba(252, 231, 243, 1))",
  border: "1px solid rgba(244, 114, 182, 0.6)",
  minHeight: "100px",
};

const footerNoteStyle = {
  fontSize: "11px",
  opacity: 0.65,
  marginTop: "6px",
  color: "#7e255e",
};

const modeButtonStyle = (active, loading) => ({
  padding: "10px 12px",
  borderRadius: "999px",
  border: "1px solid " + (active ? "#ec4899" : "rgba(244,114,182,0.6)"),
  background: active ? "#f9a8d4" : "#fce7f3",
  color: "#4a044e",
  fontWeight: 600,
  fontSize: "12px",
  cursor: loading ? "not-allowed" : "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  boxShadow: active
    ? "0 10px 25px rgba(236,72,153,0.4)"
    : "0 3px 10px rgba(244,114,182,0.25)",
  transition: "all 0.12s ease-out",
  opacity: loading && !active ? 0.7 : 1,
});

const micButtonStyle = (listening) => ({
  padding: "6px 10px",
  borderRadius: "999px",
  border: "1px solid " + (listening ? "#ec4899" : "rgba(244,114,182,0.7)"),
  background: listening ? "#f9a8d4" : "#ffe4f1",
  color: "#4a044e",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontSize: "12px",
  fontWeight: 600,
  cursor: "pointer",
  boxShadow: listening
    ? "0 8px 22px rgba(236,72,153,0.45)"
    : "0 4px 12px rgba(244,114,182,0.25)",
  transition: "all 0.12s ease-out",
});

const voiceToggleStyle = (on) => ({
  padding: "6px 10px",
  borderRadius: "999px",
  border: "1px solid " + (on ? "#16a34a" : "rgba(148,163,184,0.9)"),
  background: on ? "#bbf7d0" : "#e5e7eb",
  color: "#064e3b",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  fontSize: "12px",
  fontWeight: 600,
  cursor: "pointer",
  boxShadow: on
    ? "0 8px 22px rgba(22,163,74,0.4)"
    : "0 4px 12px rgba(148,163,184,0.4)",
  transition: "all 0.12s ease-out",
});

export default Home;
