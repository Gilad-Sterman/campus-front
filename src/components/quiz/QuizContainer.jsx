import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import QuizStartPage from './QuizStartPage.jsx';
import QuizPage from './QuizPage.jsx';
import QuizResults from './QuizResults.jsx';
import quizStorage from '../../services/quizStorage.js';

const QuizContainer = () => {
  const [currentView, setCurrentView] = useState('start'); // start, quiz, results
  const { status } = useSelector(state => state.quiz);
  const { isAuthenticated, quizState, loading } = useSelector(state => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    // If user is authenticated and has completed quiz in database, redirect to profile results
    if (isAuthenticated && quizState?.data?.status === 'completed') {
      navigate('/quiz/results');
      return;
    }

    // For authenticated users, check server-based progress
    if (isAuthenticated && quizState?.data?.status === 'in_progress') {
      setCurrentView('quiz');
      return;
    }

    // For anonymous users, check localStorage
    if (!isAuthenticated) {
      const session = quizStorage.getSession();

      if (session) {
        if (session.status === 'completed') {
          setCurrentView('results');
        } else if (session.status === 'in_progress' && session.answers && session.answers.length > 0) {
          setCurrentView('quiz');
        }
      }
    }
  }, [isAuthenticated, quizState]);

  // Show loading while auth state is being determined
  if (loading) {
    return (
      <div className="quiz-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  // Remove auto-switching to results - let user click Finish button manually

  const handleStartQuiz = () => {
    setCurrentView('quiz');
  };

  const handleQuizComplete = () => {
    if (isAuthenticated) {
      navigate('/quiz/results');
    } else {
      setCurrentView('results');
    }
  };

  const handleGetFullReport = () => {
    // Navigate to login page with quiz context using React Router
    navigate('/login?mode=signup&redirect=/quiz/results&action=get-full-report');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'start':
        return <QuizStartPage onStart={handleStartQuiz} />;
      case 'quiz':
        return <QuizPage onComplete={handleQuizComplete} />;
      case 'results':
        return <QuizResults onGetFullReport={handleGetFullReport} />;
      default:
        return <QuizStartPage onStart={handleStartQuiz} />;
    }
  };

  return (
    <div className="quiz-container">
      {renderCurrentView()}
    </div>
  );
};

export default QuizContainer;
