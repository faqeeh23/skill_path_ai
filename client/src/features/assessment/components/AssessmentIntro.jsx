
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBrain, faArrowRight, faCircleInfo
} from "@fortawesome/free-solid-svg-icons";

export default function AssessmentIntro({ goal, onStart }) {
  return (
    <div className="assessment-intro">
      <div className="assessment-icon">
        <FontAwesomeIcon icon={faBrain} />
      </div>

      <span className="eyebrow">INITIAL SKILL ASSESSMENT</span>
      <h1>Discover your starting point.</h1>

      <p>
        You selected <strong>{goal.title}</strong>.
        Let's explore your current knowledge with a short demo assessment.
      </p>

      <div className="assessment-info">
        <FontAwesomeIcon icon={faCircleInfo} />
        <span>
          This prototype contains two sample questions. Your answers
          will not produce a real AI skill estimate.
        </span>
      </div>

      <button className="assessment-button" onClick={onStart}>
        Start assessment
        <FontAwesomeIcon icon={faArrowRight} />
      </button>
    </div>
  );
}
