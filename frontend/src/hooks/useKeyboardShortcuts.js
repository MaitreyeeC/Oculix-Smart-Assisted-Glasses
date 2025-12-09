import { useEffect } from "react";

export default function useKeyboardShortcuts({
  repeatOutput,
  toggleVoice,
  changeMode
}) {
  useEffect(() => {
    const handleKey = (e) => {
      // Space → repeat last output
      if (e.code === "Space") {
        e.preventDefault();
        repeatOutput();
      }

      // Numbers 1-6 → switch mode
      if (e.key >= "1" && e.key <= "6") {
        changeMode(parseInt(e.key));
      }

      // V → Voice toggle
      if (e.key.toLowerCase() === "v") {
        toggleVoice();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [repeatOutput, toggleVoice, changeMode]);
}
