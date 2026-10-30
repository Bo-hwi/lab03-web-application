import React from "react";
import { createRoot } from "react-dom/client";
import { DeveloperCard } from "../src/exercises/DeveloperCard.jsx";
import "../src/styles.css";

createRoot(document.getElementById("root")).render(
  <DeveloperCard developer={{
    id: "fallback-check",
    name: "Bao Huy",
    role: "Frontend Developer",
    location: "Ho Chi Minh City",
    summary: "Avatar fallback check.",
    avatar: "data:image/png;base64,invalid",
    skills: [{ id: "html", name: "HTML" }],
  }} />,
);
