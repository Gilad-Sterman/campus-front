import { useDispatch, useSelector } from 'react-redux';
import { startQuiz, loadSession } from '../../store/slices/quizSlice.js';
import { useEffect } from 'react';

const QuizStartPage = ({ onStart }) => {
  const dispatch = useDispatch();
  const { canResume, resumeInfo, isLoading, error } = useSelector(state => state.quiz);
  const { isAuthenticated, user } = useSelector(state => state.auth);

  useEffect(() => {
    // Load session on mount to check if can resume
    dispatch(loadSession());
  }, [dispatch]);

  const handleStart = async () => {
    try {
      await dispatch(startQuiz()).unwrap();
      onStart();
    } catch (error) {
      console.error('Failed to start quiz:', error);
    }
  };

  const handleResume = () => {
    // Resume is handled by loading existing session
    onStart();
  };

  return (
    <div className="quiz-start-page">
      <div className="quiz-start-hero">
        <h1 className="quiz-hero-title">PathFinder</h1>
        <div className="quiz-hero-image">
          <img src="https://mzyjtmyoxpsnnxsvucup.supabase.co/storage/v1/object/public/university-logos/GettyImages-2248592663.jpg" alt="Quiz Welcome" />
        </div>
        <div className="quiz-hero-description">
        <h2>READY TO DISCOVER YOUR ACADEMIC FIT IN ISRAEL?</h2>
          <p>Understand what you’re great at and find where you’ll thrive. Academically, culturally, and socially.</p>
          <p>Takes less than 5 minutes. No commitment – just insight.</p>
          <p>Your future is waiting.</p>
        </div>
        {/* <div className="quiz-hero-description">
          <p>
            <strong>
              When&apos;s the last time you took 15 minutes to discover new things about yourself?
              How you think. What drives you. Where you actually thrive.
            </strong>
          </p>

          <p>
            I&apos;ll help you figure that out: my questionnaire is quick, simple and designed to give you real clarity.
            Important: I am not here to judge you!
          </p>

          <p>
            Think of it as a coffee date with a new friend: the more honest you are, the better I can guide you.
            You&apos;ll walk away with a full report with what we discovered about your values, goals, and passions,
            plus recommendations for degrees where people like you thrive.
          </p>

          <p>
            It takes about 15 minutes. I&apos;ll ask you some questions, I&apos;ll get to know who you are, and I&apos;ll do
            everything I can to help you choose the best path for you. Your answers stay private.
          </p>

          <p><strong>Ready to start?</strong></p>
        </div> */}
      </div>

      <div className="quiz-start-content">

        {error && (
          <div className="error-message">
            <p>Error: {error}</p>
          </div>
        )}

        <div className="quiz-info">
          {isAuthenticated ? (
            <p>
              <strong>Welcome back, {user?.firstName}!</strong> Your quiz progress will be saved to your account.
            </p>
          ) : (
            <p>
              <strong>This quiz is anonymous</strong> — your answers are only saved on this device.
              Want to keep them forever? Get your full report by signing up at the end.
            </p>
          )}
        </div>

        {canResume && resumeInfo ? (
          <div className="resume-section">
            <div className="resume-info">
              <p>
                <strong>Welcome back!</strong> You've answered{' '}
                <span className="resume-stats">{resumeInfo.answeredCount} questions</span>.
                Want to pick up where you left off?
              </p>
            </div>

            <button
              className="resume-btn"
              onClick={handleResume}
              disabled={isLoading}
            >
              Continue Quiz
            </button>

            <div className="or-divider">
              <button
                className="quiz-cta"
                onClick={handleStart}
                disabled={isLoading}
              >
                Start Over
              </button>
            </div>
          </div>
        ) : (
          <button
            className="quiz-cta"
            onClick={handleStart}
            disabled={isLoading}
          >
            {isLoading ? 'Starting...' : 'Lets Start!'}
          </button>
        )}


      </div>
    </div>
  );
};

export default QuizStartPage;
