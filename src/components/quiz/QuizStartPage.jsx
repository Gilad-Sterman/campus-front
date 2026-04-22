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
        {/* <h1 className="quiz-hero-title">PathFinder</h1> */}
        {/* <div className="quiz-hero-image">
          <img src="https://wdukbpwyysjbkdzjtguv.supabase.co/storage/v1/object/public/university-logos/pathfinder.JPG" alt="Quiz Welcome" />
        </div> */}
        <div className="quiz-hero-description">
          <h1>Hey! Welcome to PathFinder</h1>
          {/* <p>Takes less than 5 minutes. No commitment – just insight.</p> */}
          {/* <p>Your future is waiting.</p> */}
        </div>
      </div>
      <h2>10 minutes. Personalized degree ideas for you.</h2>
      <div className="quiz-card-container">
        <div className='quiz-start-card'>
          <img src="https://wdukbpwyysjbkdzjtguv.supabase.co/storage/v1/object/public/university-logos/Capa_1%20(2).png" alt="" />
          <p>
            <strong>Answer a few quick questions</strong>
          </p>
          No right or wrong answers
        </div>
        <div className='quiz-start-card'>
          <img src="https://wdukbpwyysjbkdzjtguv.supabase.co/storage/v1/object/public/university-logos/Capa_1.png" alt="" />
          <p>
            <strong>Discover your strengths</strong>
          </p>
          Based on how you think and learn, what you care about
        </div>
        <div className='quiz-start-card'>
          <img src="https://wdukbpwyysjbkdzjtguv.supabase.co/storage/v1/object/public/university-logos/Capa_1%20(1).png" alt="" />
          <p>
            <strong>Find your path in Israel</strong>
          </p>
          Degrees that fit you
        </div>
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
