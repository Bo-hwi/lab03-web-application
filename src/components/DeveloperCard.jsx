import { Fragment, useId, useState } from "react";
import { SkillBadge } from "./SkillBadge.jsx";

export function DeveloperCard({
  fullName = "Nguyen Bao Huy",
  role = "Frontend Developer",
  avatarUrl = "",
  metrics = {},
  skills = [],
}) {
  const headingId = useId();
  const [failedUrl, setFailedUrl] = useState(null);
  const initials = fullName.trim().split(/\s+/).filter(Boolean).slice(0, 2)
    .map((part) => part[0].toUpperCase()).join("");
  let secureAvatar = false;
  try {
    secureAvatar = new URL(avatarUrl).protocol === "https:";
  } catch {
    secureAvatar = false;
  }

  return (
    <article aria-labelledby={headingId}>
      <header>
        {secureAvatar && failedUrl !== avatarUrl ? (
          <img src={avatarUrl} width="80" height="80" alt={`Portrait of ${fullName}`}
            onError={() => setFailedUrl(avatarUrl)} />
        ) : <span aria-label={`Initials for ${fullName}`}>{initials}</span>}
        <hgroup>
          <h2 id={headingId}>{fullName}</h2>
          <p>{role}</p>
        </hgroup>
      </header>
      <dl>
        {Object.entries(metrics).map(([k, value]) => (
          <Fragment key={k}><dt>{k}</dt><dd>{value}</dd></Fragment>
        ))}
      </dl>
      <ul aria-label="Skills">
        {skills.map((skill) => <SkillBadge key={skill.id} skill={skill} />)}
      </ul>
    </article>
  );
}
