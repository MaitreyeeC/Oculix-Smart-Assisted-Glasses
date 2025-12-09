import "../VisionGlass.css";
import { useSettings } from "../context/SettingsContext";
import { useState } from "react";

export default function Settings() {
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
    esp32Url,
    setEsp32Url,
  } = useSettings();

  return (
    <div style={{ maxWidth: "900px", margin: "20px auto" }}>

      <h1 style={{
        fontSize: "34px",
        marginBottom: "28px",
        fontWeight: "700",
        color: "#4a044e"
      }}>
        🛠 Oculix Settings & Accessibility
      </h1>

      {/* Voice Output Section */}
      <div className="glass-card" style={{ padding: "20px 24px", marginBottom: "26px" }}>
        <div className="glass-section-title">🔊 Voice Output</div>

        <label style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
          <input
            type="checkbox"
            checked={voiceEnabled}
            onChange={() => setVoiceEnabled(prev => !prev)}
          />
          <span>Enable Voice Feedback</span>
        </label>

        <div className="setting-group">
          <label>Voice Gender:</label>
          <select
            className="glass-input"
            value={voiceGender}
            onChange={(e) => setVoiceGender(e.target.value)}
          >
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        </div>

        <div className="setting-group">
          <label>Voice Speed: {voiceSpeed}</label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            className="glass-slider"
            value={voiceSpeed}
            onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
          />
        </div>

        <div className="setting-group">
          <label>Volume: {voiceVolume}</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            className="glass-slider"
            value={voiceVolume}
            onChange={(e) => setVoiceVolume(parseFloat(e.target.value))}
          />
        </div>
      </div>

      {/* Theme Section */}
      <div className="glass-card" style={{ padding: "20px 24px", marginBottom: "26px" }}>
        <div className="glass-section-title">🎨 Theme / Contrast</div>

        <div className="setting-group">
          <select
            className="glass-input"
            value={contrastMode}
            onChange={(e) => setContrastMode(e.target.value)}
          >
            <option value="pastel">Pastel (Soft UI)</option>
            <option value="glass">Vision Glass UI</option>
            <option value="high-contrast">Black / Yellow</option>
          </select>
        </div>
      </div>

      {/* Camera Input */}
      <div className="glass-card" style={{ padding: "20px 24px" }}>
        <div className="glass-section-title">📸 Camera Source</div>

        <div className="setting-group">
          <select
            className="glass-input"
            value={cameraSource}
            onChange={(e) => setCameraSource(e.target.value)}
          >
            <option value="default">Default Webcam</option>
            <option value="usb">External USB Camera</option>
            <option value="ar-glasses">AR Glasses (Beta)</option>
            <option value="esp32">ESP32-CAM (WiFi Stream)</option>
          </select>
        </div>

        {cameraSource === "esp32" && (
          <div style={{ marginTop: "12px" }}>
            <input
              className="glass-input"
              placeholder="Enter ESP32 Stream URL (ex: http://192.168.1.50:81/stream)"
              value={esp32Url}
              onChange={(e) => setEsp32Url(e.target.value)}
              style={{ width: "100%", padding: "8px" }}
            />
            <small style={{ opacity: 0.6 }}>Make sure ESP32 is on the same WiFi</small>
          </div>
        )}

        <p style={{ fontSize: "12px", opacity: 0.6, marginTop: "8px" }}>
          Supports USB, AR, and ESP IoT Cameras for wearable vision.
        </p>
      </div>
    </div>
  );
}
