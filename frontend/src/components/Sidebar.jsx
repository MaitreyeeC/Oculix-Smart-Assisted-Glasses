import { useSettings } from "../context/SettingsContext";
import React from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

function Sidebar({ expanded, setExpanded }) {
  const { contrastMode } = useSettings();

  return (
  <div className={`sidebar ${contrastMode} ${expanded ? "expanded" : ""}`}>
    
    {/* TOGGLE SIDEBAR ONLY WHEN CLICKING LOGO */}
    <div className="logo" onClick={() => setExpanded(!expanded)}>
      <span>👁‍🗨</span>
      {expanded && <span className="logo-text">&nbsp;Oculix AI</span>}
    </div>


      <nav>
        <NavLink to="/" className="link">
          <span>🏠</span>
          {expanded && <span className="link-text">Home</span>}
        </NavLink>

        <NavLink to="/activity" className="link">
          <span>🕓</span>
          {expanded && <span className="link-text">Activity</span>}
        </NavLink>

        <NavLink to="/settings" className="link">
          <span>⚙️</span>
          {expanded && <span className="link-text">Settings</span>}
        </NavLink>

        <NavLink to="/help" className="link">
          <span>📞</span>
          {expanded && <span className="link-text">Help</span>}
        </NavLink>
      </nav>
    </div>
  );
}
export default Sidebar;
