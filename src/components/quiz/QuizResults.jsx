import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FiCheckCircle, FiUsers, FiSearch } from 'react-icons/fi';
import SimplePieChart from '../common/SimplePieChart';
import CostComparisonChart from '../common/CostComparisonChart';

const QuizResults = ({ onGetFullReport }) => {
  const { results, isLoading, answers } = useSelector(state => state.quiz);

  const stats = results?.stats || {
    totalAnswers: results?.totalAnswers,
    avgScore: results?.avgScore,
    completedAt: results?.completedAt
  };

  // Process answers for V2 insights (Anonymous Mode)
  const answerMap = Array.isArray(answers) ? answers.reduce((acc, curr) => {
    acc[curr.questionId] = curr.answer;
    return acc;
  }, {}) : {};

  // Get section weights from enhanced scoring data (calculated weights, not raw Q5 values)
  const getSectionWeights = () => {
    if (results?.scoring?.sections) {
      return {
        degree: results.scoring.sections.degree?.weight || 0,
        campus: results.scoring.sections.campus?.weight || 0,
        city: results.scoring.sections.city?.weight || 0
      };
    }

    // Fallback to raw Q5 values if enhanced data not available
    return answerMap[5] || { degree: 0, campus: 0, city: 0 };
  };

  const priorities = getSectionWeights();

  const priorityData = [
    { label: 'degree', value: Number(priorities.degree || 0) },
    { label: 'campus', value: Number(priorities.campus || 0) },
    { label: 'city', value: Number(priorities.city || 0) }
  ];

  const priorityColors = {
    degree: '#028ec1ff',
    campus: '#016a90ff',
    city: '#094358ff'
  };

  const formatPriority = (key) => {
    const labels = { degree: 'Academic Degree', campus: 'Campus Life', city: 'City Vibes' };
    return labels[key] || key;
  };

  if (isLoading) {
    return (
      <div className="quiz-results loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Generating your results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-results">
      <div className="results-container">
        <div className="results-header">
          <h1>Your Quiz Results</h1>
        </div>


        <div className="results-content">

          {/* Display enhanced insights from results */}
          {results?.insights && (
            <div className="insights-content">
              <div className="analysis-card">
                <h4>Your Brilliance Summary</h4>
                <p>{results.insights.summary}</p>

                {/* Display personality traits */}
                {/* {results.insights.traits && results.insights.traits.length > 0 && (
                  <div className="traits-container">
                    <h5>Your Key Traits:</h5>
                    <div className="traits-list">
                      {results.insights.traits.map((trait, index) => (
                        <span key={index} className="trait-badge">
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                )} */}
              </div>

              {/* Display recommendation */}
              {/* {results.insights.recommendation && (
                <div className="analysis-card">
                  <h4>
                    Personalized Recommendation
                  </h4>
                  <p>{results.insights.recommendation}</p>
                </div>
              )} */}
            </div>
          )}
          <div className="insights-section">
            <h2>Your Priority Weights</h2>
            <div className="chart-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
              <div style={{ width: '150px', height: '150px' }}>
                <SimplePieChart data={priorityData} colors={priorityColors} />
              </div>
              <div className="legend">
                {priorityData.map(item => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div style={{ width: '12px', height: '12px', backgroundColor: priorityColors[item.label], borderRadius: '50%' }}></div>
                    <span style={{ fontWeight: 500, color: '#333' }}>{formatPriority(item.label)}: {item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* <div className="stats-section">
            <h3>Your Personality Insights</h3>

            Fallback to placeholder if no enhanced insights
            {!results?.insights && (
              <div className="analysis-grid">
                <div className="analysis-card">
                  <FiCheckCircle className="card-icon" />
                  <h4>Conscientiousness</h4>
                  <p>Discover your work style.</p>
                </div>

                <div className="analysis-card">
                  <FiUsers className="card-icon" />
                  <h4>Social & Teamwork</h4>
                  <p>Understand your team dynamics.</p>
                </div>
              </div>
            )}
          </div> */}
           <CostComparisonChart programs={results?.programMatches} />

          {/* Program Matches Section */}
          {/* {results?.programMatches && results.programMatches.length > 0 && (
            <div className="stats-section">
              <h3>Your Top Program Matches</h3>
              <p>Based on your quiz responses, here are your best program matches:</p>

              <div className="program-matches-mini">
                {results.programMatches.map((program, index) => (
                  <div key={program.program_id} className="program-match-card">
                    <div className="match-rank">#{index + 1}</div>
                    <div className="program-details">
                      <div className="program-meta">
                        <h4>{program.program_name}</h4>
                        <p className="university">{program.university_name}</p>
                        <span className="degree-type">{program.degree_level}</span>
                      </div>
                      {program.tuition_usd && (
                        <div className="program-cost">
                          ${program.tuition_usd.toLocaleString()}/year
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="insight-card">
                <h3>Next Steps</h3>
                <p>Sign up to see your full personality profile and get matched with top universities.</p>
              </div>
            </div>
          )} */}
        </div>

        <div className="cta-section">
          <h2>Unlock Your Full Report</h2>
          <p>
            Get detailed university matches and a comprehensive profile analysis.
          </p>

          <button
            className="btn btn-primary btn-large"
            onClick={onGetFullReport}
          >
            Create Free Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;
