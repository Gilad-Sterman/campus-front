const ProgressBar = ({ current, total, percentage, onprev, canGoBack, isLoading }) => {
  return (
    <div className="progress-container">
      {/* <div className="progress-info">
        <span className="progress-text">Question {current} of {total}</span>
        <span className="progress-percentage">{percentage}%</span>
      </div> */}
      <button
            className="nav-btn btn-secondary"
            onClick={onprev}
            disabled={!canGoBack || isLoading}
          >
            Back
          </button>
      
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};

export default ProgressBar;
