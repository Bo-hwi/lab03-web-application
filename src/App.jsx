import { DeveloperCard } from "./components/DeveloperCard.jsx";
import { ScientistDirectory } from "./components/ScientistDirectory.jsx";

const skills = [
  { id: "react", name: "React", level: "Intermediate" },
  { id: "css", name: "CSS", level: "Intermediate" },
];

export default function App() {
  return (
    <main>
      <DeveloperCard metrics={{ Projects: 3, Experience: "2 years" }} skills={skills} />
      <ScientistDirectory />
    </main>
  );
}
