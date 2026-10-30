import styles from "./DeveloperCard.module.css";
import { useId, useState } from "react";

export function SkillBadge({ name }) {
  return <li className={styles.skill}>{name}</li>;
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
    <article aria-labelledby={`${baseId}-name`} className={styles.card}>
      <header className={styles.header}>
        {avatarFailed ? (
          <span className={styles.initials} aria-hidden="true">{initials}</span>
        ) : (
          <img
            className={styles.avatar}
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
      <dl className={styles.details}>
        <dt>Location</dt>
        <dd>{developer.location}</dd>
        <dt>Specialty</dt>
        <dd>Accessible web applications</dd>
      </dl>
      <section aria-labelledby={`${baseId}-skills`}>
        <h3 id={`${baseId}-skills`}>Skills</h3>
        <ul className={styles.skills}>
          {developer.skills.map((skill) => <SkillBadge key={skill.id} name={skill.name} />)}
        </ul>
      </section>
    </article>
  );
}
