import { useEffect, useState } from "react";
import axios from "axios";

const BACKEND_URL = "http://127.0.0.1:8000";

export default function Activity() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/activity`);
      setLogs(res.data);
    } catch (err) {
      console.error("Failed to load logs", err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Activity Timeline</h1>

      {logs.length === 0 ? (
        <p>No activity recorded yet. Run a mode from Home.</p>
      ) : (
        logs.map((log, i) => (
          <div key={i} style={{
            background: "#ffe6f7",
            padding: "12px",
            marginBottom: "10px",
            borderRadius: "10px",
            border: "1px solid #ff9ad6"
          }}>
            <b>{log.mode}</b>
            <p>{log.message}</p>
            <small>{log.time}</small>
          </div>
        ))
      )}
    </div>
  );
}
