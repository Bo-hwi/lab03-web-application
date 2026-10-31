import { SMART_PEOPLE } from "../data/smartPeople.js";

export function ScientistDirectory() {
  return (
    <section aria-labelledby="scientists-heading">
      <h2 id="scientists-heading">Scientist & Pioneer Directory</h2>
      <ul>
        {SMART_PEOPLE.map((person) => (
          <li key={person.id}>
            {person.name} — IQ {person.iq}, age {person.age}
          </li>
        ))}
      </ul>
    </section>
  );
}
