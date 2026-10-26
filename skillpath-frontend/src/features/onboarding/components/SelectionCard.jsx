import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

export default function SelectionCard({
    title, description, icon, skills, selected, onSelected
}) {
    return(
        <button
            type="button"
            className={`selection-card ${selected ? "selected" : ""}`}
            onClick={onSelected}
            aria-pressed={selected}
        >
            <span className="selection-card-top">
                <span className="selection-icon">
                    {icon && <FontAwesomeIcon icon={icon} aria-hidden="true"/>}
                </span>
                {selected && (
                    <FontAwesomeIcon className="selection-check" icon={faCheck} aria-hidden="true" />
                )}
            </span>

            <span className="selection-title">{title}</span>
            <span className="selection-description">{description}</span>

            {skills && (
                <span className="selection-skills">
                    {skills.map(skill => (
                        <span key={skill} className="selection-skill">{skill}</span>
                    ))}
                </span>
            )}
        </button>
    )
}