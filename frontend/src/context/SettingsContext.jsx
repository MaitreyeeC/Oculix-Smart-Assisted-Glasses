import React, { createContext, useContext, useState, useEffect } from "react";

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  // 🔊 Voice Settings
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceSpeed, setVoiceSpeed] = useState(1);
  const [voiceGender, setVoiceGender] = useState("female");
  const [voiceVolume, setVoiceVolume] = useState(1);

  // 🎨 Theme / UI Mode — saved permanently
  const [contrastMode, setContrastMode] = useState(() => {
    return localStorage.getItem("theme") || "pastel";
  });

  useEffect(() => {
    localStorage.setItem("theme", contrastMode);
  }, [contrastMode]);

  // 📸 Camera Source
  const [cameraSource, setCameraSource] = useState(() => {
    return localStorage.getItem("cameraSource") || "default";
  });

  useEffect(() => {
    localStorage.setItem("cameraSource", cameraSource);
  }, [cameraSource]);

  // 🚀 ESP32 CAM URL
  const [esp32Url, setEsp32Url] = useState(() => {
    return localStorage.getItem("esp32Url") || "";
  });

  useEffect(() => {
    localStorage.setItem("esp32Url", esp32Url);
  }, [esp32Url]);

  // 🧠 Activity Log — Load from localStorage
  const [activityLog, setActivityLog] = useState(() => {
    return JSON.parse(localStorage.getItem("oculix-activity")) || [];
  });

  // 🧠 Save Activity Log Persistently
  useEffect(() => {
    localStorage.setItem("oculix-activity", JSON.stringify(activityLog));
  }, [activityLog]);

  return (
    <SettingsContext.Provider
      value={{
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
        activityLog,
        setActivityLog,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
