import { useId, useState } from "react";
import { SMART_PEOPLE } from "../data/smartPeople.js";

export function ScientistDirectory() {
  const headingId = useId();
  const queryId = useId();
  const minIqId = useId();
  const sortId = useId();
  const [people, setPeople] = useState(() => [...SMART_PEOPLE]);
  const [query, setQuery] = useState("");
  const [minIq, setMinIq] = useState(160);
  const [sortBy, setSortBy] = useState("iq-desc");

  const normalizedQuery = query.trim().toLocaleLowerCase("en");
  const visiblePeople = people
    .filter((person) =>
      person.name.toLocaleLowerCase("en").includes(normalizedQuery) &&
      person.iq >= minIq
    )
    .toSorted((a, b) =>
      sortBy === "age-asc" ? a.age - b.age : b.iq - a.iq
    );

  return (
    <section aria-labelledby={headingId}>
      <h2 id={headingId}>Scientist & Pioneer Directory</h2>
      <form role="search" onSubmit={(event) => event.preventDefault()}>
        <label htmlFor={queryId}>Search by name</label>
        <input
          id={queryId}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <label htmlFor={minIqId}>Minimum IQ</label>
        <input
          id={minIqId}
          type="number"
          min="0"
          value={minIq}
          onChange={(event) =>
            setMinIq(Number.isNaN(event.target.valueAsNumber)
              ? 0
              : event.target.valueAsNumber)
          }
        />
        <label htmlFor={sortId}>Sort by</label>
        <select
          id={sortId}
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
        >
          <option value="iq-desc">IQ, highest first</option>
          <option value="age-asc">Age, youngest first</option>
        </select>
        <button type="button" onClick={() => setPeople([...SMART_PEOPLE])}>
          Reset list
        </button>
      </form>
      <output role="status" aria-live="polite">
        Found {visiblePeople.length} pioneers
      </output>
      {visiblePeople.length === 0 ? (
        <p>No pioneers match the current filters.</p>
      ) : (
        <ul>
          {visiblePeople.map((person) => (
            <li key={person.id}>
              {person.name} — IQ {person.iq}, age {person.age}{" "}
              <button
                type="button"
                aria-label={`Delete ${person.name}`}
                onClick={() =>
                  setPeople((currentPeople) =>
                    currentPeople.filter((item) => item.id !== person.id)
                  )
                }
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
