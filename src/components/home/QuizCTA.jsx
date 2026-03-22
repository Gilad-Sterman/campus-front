import React from 'react';
import { Link } from 'react-router-dom';

const QuizCTA = ({ isLoggedIn, hasTakenQuiz, hasChurnedQuiz }) => {
  // Determine which CTA to show based on user state according to the table:
  // User State | Primary CTA
  // Not Logged In | Start Free Quiz
  // Logged In, No Quiz | Start Free Quiz
  // Logged In, Quiz Started | Continue Quiz
  // Logged In, Quiz Completed | See My Results
  // Logged In, Has Applications | See My Results
  
  const renderCtaButton = () => {
    if (hasTakenQuiz) {
      const resultsLink = isLoggedIn ? '/quiz/results' : '/quiz';
      return <Link to={resultsLink} className="btn btn-secondary btn-lg">See My Results</Link>;
    } else if (hasChurnedQuiz) {
      return <Link to="/quiz" className="btn btn-secondary btn-lg">Continue Quiz</Link>;
    } else {
      return <Link to="/quiz" className="btn btn-secondary btn-lg">Start Free Quiz</Link>;
    }
  };

  return (
    <section className="quiz-cta-section">
      <div className="container">
        <div className="quiz-cta-content">
          <h2 className='section-header'>WANT TO SEE HOW YOU FIT?</h2>
          {/* <p>
            Take our personalized quiz to discover Israeli universities and programs 
            that match your academic interests, career goals, and personal preferences.
          </p> */}
          {renderCtaButton()}
        </div>
      </div>
    </section>
  );
};

export default QuizCTA;
