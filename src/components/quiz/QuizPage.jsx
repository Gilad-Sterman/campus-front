import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  loadSession, 
  goToQuestion, 
  saveAnswer,
  saveProgressToServer,
  generateResults,
  completeQuizFromProgress 
} from '../../store/slices/quizSlice';
import { getCurrentUser } from '../../store/actions/authActions';
import quizStorage from '../../services/quizStorage';
import quizApi from '../../services/quizApi';
import {
  QUIZ_QUESTIONS,
  isAnswerValidForQuestion,
  getVisibleQuestionIds,
  getNextVisibleQuestionId,
  getPreviousVisibleQuestionId,
  getVisibleProgress,
  isQuizCompleteForAnswers,
  getTotalQuestions
} from '../../config/quizQuestions.js';
import ProgressBar from './ProgressBar.jsx';
import QuestionCard from './QuestionCard.jsx';
import QuizNavigation from './QuizNavigation.jsx';

const QuizPage = ({ onComplete }) => {
  const dispatch = useDispatch();
  const {
    currentQuestion,
    isLoading,
    error,
    answers
  } = useSelector(state => state.quiz);
  const { isAuthenticated, quizState, token } = useSelector(state => state.auth);


  const [hasAnswered, setHasAnswered] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    // Check if quiz is already completed and redirect if so
    // For authenticated users: check quizState.data.status
    // For anonymous users: check quizStorage.getSession() status

    if (isAuthenticated && quizState?.data?.status === 'completed') {
      window.location.href = '/quiz/results';
      return;
    }

    if (!isAuthenticated) {
      const localSession = quizStorage.getSession();
      if (localSession?.status === 'completed') {
        onComplete(); // Triggers the view change to results
        return;
      }
    }

    if (isAuthenticated && quizState?.data?.status === 'in_progress') {
      const serverProgress = quizState.data;

      // Clear any existing localStorage data first to avoid conflicts
      quizStorage.clearSession();

      // Create a session object from server data
      const serverAnswers = (serverProgress.answers || []).map((answer, index) => {
        if (answer && typeof answer === 'object' && 'questionId' in answer && 'answer' in answer) {
          return answer;
        }

        return {
          questionId: index + 1,
          answer,
          timestamp: new Date().toISOString()
        };
      });

      // Generate a proper session ID for authenticated users
      const sessionId = 'auth-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);

      const serverSession = {
        sessionId: sessionId,
        currentQuestion: serverProgress.currentQuestion || 1,
        currentQuestionId: serverProgress.currentQuestionId || serverProgress.currentQuestion || 1,
        answers: serverAnswers,
        status: 'in_progress',
        totalQuestions: serverProgress.totalQuestions || getTotalQuestions(),
        questionPath: serverProgress.questionPath || [serverProgress.currentQuestion || 1]
      };

      // Save to localStorage for consistency with existing quiz logic
      quizStorage.saveSession(serverSession);

      // Load the session into Redux
      dispatch(loadSession());

      // Also directly set the current question to ensure Redux state is correct
      dispatch(goToQuestion(serverProgress.currentQuestion || 1));
    } else {
      // For anonymous users, load from localStorage
      dispatch(loadSession());
    }
  }, [dispatch, isAuthenticated, quizState]);

  useEffect(() => {
    const answer = quizStorage.getAnswer(currentQuestion);
    const question = QUIZ_QUESTIONS[currentQuestion - 1];
    setHasAnswered(isAnswerValidForQuestion(question, answer));
  }, [currentQuestion, answers]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentQuestion]);

  useEffect(() => {
    const visibleIds = getVisibleQuestionIds(answers);
    if (!visibleIds.includes(currentQuestion) && visibleIds.length > 0) {
      dispatch(goToQuestion(visibleIds[0]));
    }
  }, [answers, currentQuestion, dispatch]);

  // Remove auto-completion - let user click Finish button manually

  const handleAnswerSelect = async (questionId, answer) => {
    try {
      await dispatch(saveAnswer({ questionId, answer })).unwrap();
      const question = QUIZ_QUESTIONS[questionId - 1];
      setHasAnswered(isAnswerValidForQuestion(question, answer));
    } catch (error) {
      console.error('Failed to save answer:', error);
    }
  };

  const handlePrevious = () => {
    const previousQuestionId = getPreviousVisibleQuestionId(currentQuestion, answers);
    if (previousQuestionId) {
      dispatch(goToQuestion(previousQuestionId));
    }
  };

  const handleNext = async () => {
    if (isNavigating) {
      return;
    }

    setIsNavigating(true);

    try {
      // Auto-save for statement questions
      const currentQuestionData = QUIZ_QUESTIONS.find(q => q.id === currentQuestion);
      if (currentQuestionData?.type === 'statement') {
        const answer = true;
        await dispatch(saveAnswer({ questionId: currentQuestion, answer })).unwrap();
        // Update local hasAnswered state immediately
        setHasAnswered(true);
      }

      const nextQuestionId = getNextVisibleQuestionId(currentQuestion, answers);

      if (nextQuestionId) {
        // Save progress to server for authenticated users before moving to next question
        if (isAuthenticated) {
          try {
            const session = quizStorage.getSession();

            await dispatch(saveProgressToServer({
              currentQuestion: nextQuestionId,
              currentQuestionId: nextQuestionId,
              answers, // Note: this might be slightly stale for the *current* statement answer, but usually acceptable
              questionPath: [...(session?.questionPath || []), nextQuestionId]
            })).unwrap();
          } catch (error) {
            console.warn('Failed to save progress to server:', error);
            // Continue anyway - local storage still has the data
          }
        }

        dispatch(goToQuestion(nextQuestionId));
      } else if (hasAnswered && isQuizCompleteForAnswers(answers)) {
        // Last question - complete the quiz
        await handleQuizComplete();
      }
    } finally {
      setIsNavigating(false);
    }
  };

  const handleQuizComplete = async () => {
    try {
      if (isAuthenticated) {
        // For authenticated users, use the dedicated completion API
        try {
          // Use the Redux thunk to complete quiz and sync auth state
          await dispatch(completeQuizFromProgress(answers)).unwrap();

          // Mark as completed in localStorage for consistency
          const session = quizStorage.getSession();
          if (session) {
            session.status = 'completed';
            session.completedAt = new Date().toISOString();
            quizStorage.saveSession(session);
          }

          // Redirect to full results page - auth.quizState is now synced
          onComplete();
        } catch (error) {
          console.warn('Failed to complete quiz on server, continuing with local completion:', error);
          // Continue with local completion as fallback
          await dispatch(generateResults()).unwrap();
          onComplete();
        }
      } else {
        // For anonymous users, use the existing flow
        await dispatch(generateResults()).unwrap();
        onComplete();
      }
    } catch (error) {
      console.error('Failed to complete quiz:', error);
    }
  };

  const currentQuestionData = QUIZ_QUESTIONS[currentQuestion - 1];
  const currentAnswer = quizStorage.getAnswer(currentQuestion);

  const visibleProgress = getVisibleProgress(currentQuestion, answers);
  const canGoBack = !!getPreviousVisibleQuestionId(currentQuestion, answers);
  const canGoNext = hasAnswered;

  return (
    <div className="quiz-page">
      <div className="quiz-container">
        <div className="quiz-header">
          <span className="progress-text">Question {visibleProgress.current} of {visibleProgress.total}</span>
          <ProgressBar
            current={visibleProgress.current}
            total={visibleProgress.total}
            onprev={handlePrevious}
            canGoBack={canGoBack}
            isLoading={isLoading}
            percentage={visibleProgress.total > 0 ? Math.round((visibleProgress.current / visibleProgress.total) * 100) : 0}
          />
        </div>

        {error && (
          <div className="error-message">
            <p>Error: {error}</p>
          </div>
        )}

        <div className="quiz-content">
          <QuestionCard
            questionId={currentQuestion}
            question={currentQuestionData}
            currentAnswer={currentAnswer}
            onAnswerSelect={handleAnswerSelect}
            isLoading={isLoading}
          />

          <QuizNavigation
            currentQuestion={visibleProgress.current}
            totalQuestions={visibleProgress.total}
            canGoBack={canGoBack}
            canGoNext={canGoNext}
            onPrevious={handlePrevious}
            onNext={handleNext}
            isLoading={isLoading || isNavigating}
          />
        </div>
      </div>

    </div>
  );
};

export default QuizPage;
