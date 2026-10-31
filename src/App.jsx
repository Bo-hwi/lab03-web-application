import { useState } from "react";
import { DeveloperCard } from "./components/DeveloperCard.jsx";
import { PubgMatchTelemetry } from "./components/PubgMatchTelemetry.jsx";
import { ScientistDirectory } from "./components/ScientistDirectory.jsx";
import { PUBG_VN_SQUADS } from "./data/pubgSquads.js";

const skills = [
  { id: "react", name: "React", level: "Intermediate" },
  { id: "css", name: "CSS", level: "Intermediate" },
];

export default function App() {
  const [squadId, setSquadId] = useState("te");

  return (
    <main>
      <DeveloperCard metrics={{ Projects: 3, Experience: "2 years" }} skills={skills} />
      <ScientistDirectory />
      <section aria-label="PUBG Vietnam Series squads">
        <h2>PUBG Vietnam Series</h2>
        <ul>
          {PUBG_VN_SQUADS.map((squad) => (
            <li key={squad.id}>
              <button
                type="button"
                aria-pressed={squadId === squad.id}
                onClick={() => setSquadId(squad.id)}
              >
                {squad.name}
              </button>
            </li>
          ))}
        </ul>
        <PubgMatchTelemetry key={squadId} squadId={squadId} />
      </section>
    </main>
  );
}

