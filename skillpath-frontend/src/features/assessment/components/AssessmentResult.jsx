
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartPie, faRotateRight
} from "@fortawesome/free-solid-svg-icons";

export default function AssessmentResult({ result, onRestart }) {
  return (
    <div className="assessment-result">
      <div className="assessment-icon">
        <FontAwesomeIcon icon={faChartPie} />
      </div>

      <span className="eyebrow">ASSESSMENT PREVIEW</span>
      <h1>Your demo results</h1>
      <p>
        Here's how you performed on the sample questions.
        This is not an AI-generated skill proficiency score.
      </p>

      <div
        className="assessment-result-score"
        style={{ "--score-pct": result.percentage }}
      >
        <strong>{result.percentage}%</strong>
        <span>Sample quiz accuracy</span>
      </div>

      <div className="assessment-result-stats">
        <div>
          <span>Correct answers</span>
          <strong>{result.correctAnswers}</strong>
        </div>
        <div>
          <span>Questions</span>
          <strong>{result.totalQuestions}</strong>
        </div>
      </div>

      <div className="assessment-info">
        Real adaptive assessments will estimate skill proficiency
        using an assessment model after backend integration.
      </div>

      <button className="assessment-button" onClick={onRestart}>
        <FontAwesomeIcon icon={faRotateRight} />
        Try again
      </button>
    </div>
  );
}
