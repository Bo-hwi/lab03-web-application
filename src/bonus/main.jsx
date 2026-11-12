import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SituationshipAnalyzer } from "./SituationshipAnalyzer.jsx";
import "./bonus.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <SituationshipAnalyzer />
  </StrictMode>,
);
