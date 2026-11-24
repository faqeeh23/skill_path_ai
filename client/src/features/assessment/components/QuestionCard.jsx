
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight, faCircleCheck
} from "@fortawesome/free-solid-svg-icons";

export default function QuestionCard({
  question, index, total,
  selectedIndex, onSelect, onSubmit
}) {
  return (
    <div className="assessment-question">
      <div className="assessment-question-top">
        <span className="eyebrow">{question.skill}</span>
        <span>Question {index + 1} of {total}</span>
      </div>

      <div
        className="assessment-progress"
        role="progressbar"
        aria-label="Assessment question progress"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={index + 1}
      >
        <div style={{ width: `${((index + 1) / total) * 100}%` }} />
      </div>

      <h1>{question.question}</h1>

      <div className="assessment-options" role="radiogroup" aria-label="Answer options">
        {question.options.map((option, i) => (
          <label
            key={i}
            className={`assessment-option ${selectedIndex === i ? "selected" : ""}`}
          >
            <input
              type="radio"
              name={`answer-${question.id}`}
              value={i}
              checked={selectedIndex === i}
              onChange={() => onSelect(i)}
            />
            <span className="assessment-option-letter">
              {String.fromCharCode(65 + i)}
            </span>
            <span>{option}</span>
            {selectedIndex === i && (
              <FontAwesomeIcon icon={faCircleCheck} className="assessment-selected-icon" />
            )}
          </label>
        ))}
      </div>

      <div className="assessment-actions">
        <button
          type="button"
          className="assessment-button"
          disabled={selectedIndex === null}
          onClick={onSubmit}
        >
          {index + 1 === total ? "Finish assessment" : "Submit & continue"}
          <FontAwesomeIcon icon={faArrowRight} />
        </button>
      </div>
    </div>
  );
}
