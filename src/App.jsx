import { DeveloperCard } from "./exercises/DeveloperCard.jsx";
import { useEffect, useState } from "react";

const exercises = [
  { id: "developer", label: "Developer Card" },
  { id: "scientists", label: "Scientist Directory" },
  { id: "telemetry", label: "PUBG Match Telemetry" },
];

function currentPage() {
  const page = window.location.hash.slice(1);
  return exercises.some((item) => item.id === page) ? page : "home";
}

export default function App() {
  const [page, setPage] = useState(currentPage);

  useEffect(() => {
    const onHashChange = () => setPage(currentPage());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <>
      <header className="site-header">
        <a className="brand" href="#home">Lab 03</a>
        <nav aria-label="Exercises">
          <ul className="site-nav">
            {exercises.map((item) => (
              <li key={item.id}><a href={`#${item.id}`}>{item.label}</a></li>
            ))}
          </ul>
        </nav>
      </header>
      <main id="main-content" className="page-shell">
        <h1>{page === "home" ? "Production React 19 Lab" : exercises.find((item) => item.id === page)?.label}</h1>
        {page === "developer" ? <DeveloperCard /> : <p>Choose an exercise from the navigation.</p>}
      </main>
    </>
  );
}
