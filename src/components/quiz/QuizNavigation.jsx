const QuizNavigation = ({ 
  currentQuestion, 
  totalQuestions, 
  canGoBack, 
  canGoNext, 
  onPrevious, 
  onNext, 
  isLoading 
}) => {
  return (
    <div className="quiz-navigation">
      {/* <button
        className="nav-btn nav-btn-secondary"
        onClick={onPrevious}
        disabled={!canGoBack || isLoading}
      >
        ← Back
      </button> */}

      <div className="question-indicator">
        {/* {currentQuestion} / {totalQuestions} */}
      </div>

      <button
        className="nav-btn nav-btn-primary"
        onClick={onNext}
        disabled={!canGoNext || isLoading}
      >
        {currentQuestion === totalQuestions ? 'Finish' : 'Next'}
      </button>

    </div>
  );
};

export default QuizNavigation;
