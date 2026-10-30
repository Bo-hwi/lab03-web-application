import { useId, useState } from "react";

export function SkillBadge({ name }) {
  return <li className="skill-badge">{name}</li>;
}

export function DeveloperCard({
  developer = {
    id: "dev-01",
    name: "Nguyen Bao Huy",
    role: "Frontend Developer",
    location: "Ho Chi Minh City, Vietnam",
    summary: "I build accessible, reliable interfaces with React and browser APIs.",
    avatar: "https://i.pravatar.cc/160?img=12",
    skills: [
      { id: "html", name: "HTML" },
      { id: "css", name: "CSS" },
      { id: "javascript", name: "JavaScript" },
      { id: "react", name: "React 19" },
    ],
  },
}) {
  const [avatarFailed, setAvatarFailed] = useState(false);
  const baseId = useId();
  const initials = developer.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <article aria-labelledby={`${baseId}-name`} className="developer-card">
      <header className="developer-card__header">
        {avatarFailed ? (
          <span className="developer-card__initials" aria-hidden="true">{initials}</span>
        ) : (
          <img
            className="developer-card__avatar"
            src={developer.avatar}
            alt=""
            width="80"
            height="80"
            onError={() => setAvatarFailed(true)}
          />
        )}
        <h2 id={`${baseId}-name`}>{developer.name}</h2>
        <p>{developer.role}</p>
      </header>
      <p>{developer.summary}</p>
      <dl className="developer-card__details">
        <dt>Location</dt>
        <dd>{developer.location}</dd>
        <dt>Specialty</dt>
        <dd>Accessible web applications</dd>
      </dl>
      <section aria-labelledby={`${baseId}-skills`}>
        <h3 id={`${baseId}-skills`}>Skills</h3>
        <ul className="developer-card__skills">
          {developer.skills.map((skill) => <SkillBadge key={skill.id} name={skill.name} />)}
        </ul>
      </section>
    </article>
  );
}
