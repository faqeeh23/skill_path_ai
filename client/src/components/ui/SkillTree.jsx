export default function SkillTree({ roots, skills, isAssessed, renderMark }) {
  return (
    <div className="sp-skill-tree">
      {roots.map((id) => (
        <SkillBranch key={id} id={id} skills={skills} isAssessed={isAssessed} renderMark={renderMark} />
      ))}
    </div>
  );
}

function SkillBranch({ id, skills, isAssessed, renderMark }) {
  const skill = skills[id];
  if (!skill) return null;

  return (
    <div className="sp-skill-branch">
      <span className="sp-skill-label">
        {skill.children.length > 0 && renderMark?.(id)}
        <strong>{skill.title}</strong>
      </span>
      {skill.children.length ? (
        <div>
          {skill.children.map((child) => (
            <SkillBranch key={child} id={child} skills={skills} isAssessed={isAssessed} renderMark={renderMark} />
          ))}
        </div>
      ) : (
        <span className="sp-tag">{isAssessed(id) ? "Assessed" : "Not assessed"}</span>
      )}
    </div>
  );
}
