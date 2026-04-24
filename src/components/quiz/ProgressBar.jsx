import { FiChevronLeft } from "react-icons/fi";
import { V3_QUIZ_STATEMENTS } from "../../config/v3QuizStatements";

const ProgressBar = ({ current, total, percentage, onprev, canGoBack, isLoading, activeQuestionId }) => {
  const statement = V3_QUIZ_STATEMENTS[activeQuestionId];

  return (
    <div className="progress-outer">
      {statement && (
        <div className="quiz-badge" key={activeQuestionId}>
          <span className="badge-title">{statement.title}</span>
          {statement.description && <span className="badge-description">{statement.description}</span>}
        </div>
      )}
      <div className="progress-container">
        <button
          className="nav-btn btn-secondary"
          onClick={onprev}
          disabled={!canGoBack || isLoading}
        >
          <FiChevronLeft />
        </button>

        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${percentage}%` }} />
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
