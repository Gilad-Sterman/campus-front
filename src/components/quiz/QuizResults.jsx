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

  const studentName = answers?.find(a => a.questionId === 1)?.answer || results?.user?.name || '';

  // Get section weights from enhanced scoring data
  const getSectionWeights = () => {
    // V3 Weights
    if (results?.scoring?.v3?.weights) {
      return {
        academic: results.scoring.v3.weights.academic * 100,
        environment: results.scoring.v3.weights.environment * 100
      };
    }

    // V3 specific weights (Preferred)
    const v3Data = results?.scoring?.v3?.weights || results?.v3_data?.weights || results?.section_weights;
    if (v3Data && (v3Data.academic || v3Data.environment || (v3Data.weights && (v3Data.weights.academic || v3Data.weights.environment)))) {
      const weights = v3Data.weights || v3Data;
      return {
        academic: Math.round((weights.academic?.weight || weights.academic || 0) * (weights.academic < 1 ? 100 : 1)),
        environment: Math.round((weights.environment?.weight || weights.environment || 0) * (weights.environment < 1 ? 100 : 1))
      };
    }

    // Legacy Weights (V1)
    const sects = results?.scoring?.sections || results?.section_weights;
    if (sects) {
      const sectionData = typeof sects === 'string' ? JSON.parse(sects) : sects;
      return {
        degree: sectionData.degree?.weight || sectionData.degree || 40,
        campus: sectionData.campus?.weight || sectionData.campus || 30,
        city: sectionData.city?.weight || sectionData.city || 30
      };
    }

    // Fallback logic
    return { degree: 40, campus: 30, city: 30 };
  };

  const priorities = getSectionWeights();
  const isV3 = results?.version === 'v3' || (priorities.academic !== undefined);

  // Prepare chart data based on version
  const priorityData = isV3
    ? [
      { label: 'academic', value: Math.round(priorities.academic || 0) },
      { label: 'environment', value: Math.round(priorities.environment || 0) }
    ]
    : [
      { label: 'degree', value: Math.round(priorities.degree || 0) },
      { label: 'campus', value: Math.round(priorities.campus || 0) },
      { label: 'city', value: Math.round(priorities.city || 0) }
    ];

  const priorityColors = {
    degree: '#028ec1ff',
    campus: '#016a90ff',
    city: '#094358ff',
    academic: '#028ec1ff',
    environment: '#016a90ff'
  };

  const formatPriority = (key) => {
    const labels = {
      degree: 'Academic Degree',
      campus: 'Campus Life',
      city: 'City Vibes',
      academic: 'Academic Fit',
      environment: 'Environment Fit'
    };
    return labels[key] || key;
  };

  const getUniqueUniversities = () => {
    if (!results?.programMatches?.length) return [];

    const uniqueUniversityNames = [...new Set(results.programMatches.map(program => program.university_name))];
    return uniqueUniversityNames
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
      <div className='results-top'>
        <h2>Thank you, {studentName}</h2>
        <div className='results-description'>
          <img src="https://wdukbpwyysjbkdzjtguv.supabase.co/storage/v1/object/public/university-logos/svg2427.svg" alt="" />
          <p className='mb-5'>Scroll down to see your degree suggestions and look out for your full results report in your inbox. Whenever you're ready, our concierge team is one click away via the booking link in the email.</p>
        </div>
      </div>
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

                {/* Display personality traits / RIASEC top interests */}
                {/* {results.insights.traits && results.insights.traits.length > 0 && (
                  <div className="traits-card">
                    <h5>Your Key Strengths:</h5>
                    <div className="traits-list">
                      {results.insights.traits.map((trait, index) => (
                        <span key={index} className="trait-badge">
                          {trait}
                        </span>
                      ))}{' '}

                    </div>
                  </div>
                )} */}
              </div>

              {/* V3 RIASEC Teaser */}
              {/* {isV3 && results?.scoring?.riasec && (
                <div className="analysis-card">
                  <h4>Top Interests</h4>
                  <div className="riasec-teaser">
                    {Object.entries(results.scoring.riasec)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 2)
                      .map(([key, score]) => (
                        <div key={key} className="riasec-badge">
                          <span className="riasec-label">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                          <span className="riasec-value">{(Number(score) || 0).toFixed(1)}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )} */}
            </div>
          )}

          {/* <div className="insights-section">
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
          </div> */}

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
          <CostComparisonChart programs={(results?.programMatches || []).slice(0, 3)} />

          {/* Program Matches Section */}
          {/* {results?.programMatches && results.programMatches.length > 0 && (
            <div className="stats-section">
              <h3>Your Top Program Matches</h3>
              <p>Based on your quiz responses, here are your best program matches:</p>

              <div className="program-matches-mini">
                {(results.programMatches || []).slice(0, 3).map((program, index) => (
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

          {/* Cost Comparison Table */}
          {/* {results?.programMatches && results.programMatches.length > 0 && (
            <div className='compare-table'>
              <div className="results-table-container">
                <h2>Tuition Comparison</h2>
                <div className="comparison-table">
                  {(() => {
                    const uniqueUniversities = getUniqueUniversities();

                    // Only show table if we have universities and cost data
                    if (uniqueUniversities.length === 0) {
                      return <div className="loading-state">Loading cost comparison...</div>;
                    }

                    return (
                      <table>
                        <thead>
                          <tr>
                            <th>Category</th>
                            {uniqueUniversities.map((university, index) => (
                              <th key={university.name}>
                                {university.name}
                              </th>
                            ))}
                            <th className='white'>Average US University</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="total-row">
                            <td className="category-cell total-category">
                              <strong>{'Tuition & Fees'}</strong>
                            </td>
                            {uniqueUniversities.map((university) => {
                              return (
                                <td key={university.name} className="total-cell">
                                  {university.tuition}
                                </td>
                              );
                            })}
                            <td className="total-cell white">$40,000</td>
                          </tr>
                        </tbody>
                      </table>
                    );
                  })()}
                </div>
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
