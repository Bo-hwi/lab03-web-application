import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { PianoBrowserGate } from "./piano-browser-gate.jsx";
import "../src/styles.css";

createRoot(document.getElementById("root")).render(
  <StrictMode><PianoBrowserGate /></StrictMode>,
);
