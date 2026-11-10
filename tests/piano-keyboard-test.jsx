import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PianoKeyboard } from "../src/homeworks/GrandPiano88/PianoKeyboard.jsx";
import "../src/styles.css";

createRoot(document.getElementById("root")).render(
  <StrictMode><PianoKeyboard /></StrictMode>,
);
