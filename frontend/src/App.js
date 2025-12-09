import { useSettings } from "./context/SettingsContext";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Activity from "./pages/Activity";
import Settings from "./pages/Settings";
import Emergency from "./pages/Emergency"; // Help = Emergency
import Sidebar from "./components/Sidebar";
import { useState } from "react";

function App() {
  const { contrastMode } = useSettings();
  const [expanded, setExpanded] = useState(false);

  return (
    <BrowserRouter>
      <div style={{ display: "flex" }}>
        <Sidebar expanded={expanded} setExpanded={setExpanded} />

        <div
          style={{
            marginLeft: expanded ? "200px" : "70px",
            transition: "margin-left 0.3s ease",
            padding: "32px 40px",
            width: "100%",
            minHeight: "100vh",
            boxSizing: "border-box",
            background:
              contrastMode === "pastel"
                ? "radial-gradient(circle at top left, #ffe6f7 0%, #ffd7ef 38%, #fff1fb 70%, #ffe6f7 100%)"
                : contrastMode === "glass"
                ? "rgba(255,255,255,0.35)"
                : contrastMode === "high-contrast"
                ? "#000"
                : "#f8fafc",
            color: contrastMode === "high-contrast" ? "yellow" : "#4a044e",
            backdropFilter:
              contrastMode === "glass" ? "blur(18px) saturate(180%)" : "none",
          }}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/activity" element={<Activity />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/help" element={<Emergency />} />  {/* Help Screen */}
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
