import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAddToMyApplications } from '../../hooks/useAddToMyApplications';
import { FiTarget, FiCalendar, FiBookOpen, FiUsers, FiMonitor, FiSearch, FiCheckCircle, FiArrowRight } from 'react-icons/fi';
import { QUIZ_QUESTIONS } from '../../config/quizQuestions.js';
import SimplePieChart from '../common/SimplePieChart';
import CostComparisonChart from '../common/CostComparisonChart';
import programMatchingApi from '../../services/programMatchingApi.js';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

const QuizSummary = () => {
  const { addProgram } = useAddToMyApplications();
  const { quizState } = useSelector(state => state.auth);
  const [matchedPrograms, setMatchedPrograms] = useState([]);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [matchingError, setMatchingError] = useState(null);

  // Check quiz status for authenticated users only
  const hasCompletedQuiz = quizState?.data?.status === 'completed';
  const hasInProgressQuiz = quizState?.data?.status === 'in_progress';

  // Get answers from auth.quizState.data.answers
  const answers = quizState?.data?.answers || [];

  // Create a map for easier access
  const answerMap = Array.isArray(answers) ? answers.reduce((acc, curr) => {
    acc[curr.questionId] = curr.answer;
    return acc;
  }, {}) : {};

  // Get section weights from enhanced scoring data
  const getSectionWeights = () => {
    // V3 Weights - check top level or nested results
    const v3Data = quizState?.data?.scoring?.v3?.weights || quizState?.data?.v3_data?.weights || quizState?.data?.v3?.weights || quizState?.data?.section_weights;
    if (v3Data && (v3Data.academic || v3Data.environment || (v3Data.weights && (v3Data.weights.academic || v3Data.weights.environment)))) {
      const weights = v3Data.weights || v3Data;
      return {
        academic: Math.round((weights.academic?.weight || weights.academic || 0) * (weights.academic < 1 ? 100 : 1)),
        environment: Math.round((weights.environment?.weight || weights.environment || 0) * (weights.environment < 1 ? 100 : 1))
      };
    }

    const sectionWeights = quizState?.data?.section_weights || quizState?.data?.results?.scoring?.sections;
    if (sectionWeights) {
      const sectionData = typeof sectionWeights === 'string'
        ? JSON.parse(sectionWeights)
        : sectionWeights;

      return {
        degree: sectionData?.degree?.weight || sectionData?.degree || 40,
        campus: sectionData?.campus?.weight || sectionData?.campus || 30,
        city: sectionData?.city?.weight || sectionData?.city || 30
      };
    }

    // Fallback logic
    return { degree: 40, campus: 30, city: 30 };
  };

  const priorities = getSectionWeights();
  const isV3 = quizState?.data?.version === 'v3' || (priorities.academic !== undefined);


  // Helper to format priority label
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

  const priorityColors = {
    degree: '#028ec1ff',
    campus: '#016a90ff',
    city: '#094358ff',
    academic: '#028ec1ff',
    environment: '#016a90ff'
  };


  // Fetch program matches when component mounts and quiz is completed
  useEffect(() => {
    const fetchProgramMatches = async () => {
      if (!hasCompletedQuiz || !quizState?.data) return;

      setMatchingLoading(true);
      setMatchingError(null);

      try {
        // Build student profile from quiz data
        const studentProfile = {
          riasec_scores: quizState.data.riasec_scores,
          personality_scores: quizState.data.personality_scores,
          section_weights: quizState.data.section_weights,
          brilliance_summary: quizState.data.brilliance_summary,
          answers: quizState.data.answers
        };

        const response = await programMatchingApi.matchPrograms(studentProfile);

        if (response.success && response.programs) {
          setMatchedPrograms(response.programs);
        } else {
          setMatchingError('Failed to load program matches');
        }
      } catch (error) {
        console.error('Program matching error:', error);
        setMatchingError(error.message || 'Failed to load program matches');
      } finally {
        setMatchingLoading(false);
      }
    };

    fetchProgramMatches();
  }, [hasCompletedQuiz, quizState?.data]);

  if (!hasCompletedQuiz) {
    return (
      <div className="profile-section">
        <div className="profile-section-content">
          <div className="no-quiz-results">
            <h3>No Quiz Results Found</h3>
            <p>
              Take our quick assessment to get personalized program recommendations
              and discover the best universities for your goals.
            </p>

            <div className="quiz-cta">
              {hasInProgressQuiz ? (
                <Link to="/quiz" className="btn-primary">
                  <FiTarget size={16} /> Continue Quiz
                </Link>
              ) : (
                <Link to="/quiz" className="btn-primary">
                  <FiTarget size={16} /> Start Quiz
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-section">
      <div className="profile-section-content">
        <div className="quiz-results">
          <div className="summary-header">
            <h2>YOUR RESULTS</h2>
          </div>

          <div className="results-analysis">
            {/* Display validity warning if applicable */}
            {isV3 && quizState?.data?.v3?.validity_check && !quizState.data.v3.validity_check.is_valid && (
              <div className="validity-warning">
                <FiCheckCircle className="warning-icon" />
                <div className="warning-content">
                  <h4>Profile Reliability</h4>
                  <p>Your responses show a high level of consistency, which may affect the specificity of your matches. Consider retaking the quiz if these results don't feel quite right.</p>
                </div>
              </div>
            )}

            {/* Display enhanced personality data from database */}
            {quizState?.data?.brilliance_summary && (

              <div className='analysis-grid'>
                <div className="analysis-card">
                  <h4>
                    Your Brilliance Summary
                  </h4>
                  <p>{quizState.data.brilliance_summary}</p>
                </div>
              </div>
            )}
            <h3>Your Priorities</h3>
            <p className="section-description">Your calculated priority weights in our matching algorithm:</p>
            <div className="priorities-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '250px', height: '250px' }}>
                <SimplePieChart
                  data={Object.entries(priorities).map(([key, value]) => ({ label: key, value }))}
                  colors={priorityColors}
                />
              </div>
              <div className="priorities-grid" style={{ width: '100%', gridTemplateColumns: isV3 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)' }}>
                {Object.entries(priorities).map(([key, value]) => (
                  <div key={key} className="priority-card">
                    <div style={{ width: '12px', height: '12px', backgroundColor: priorityColors[key], borderRadius: '50%', margin: '0 auto 0.5rem' }}></div>
                    <div className="priority-value">{Math.round(value)}%</div>
                    <div className="priority-label">{formatPriority(key)}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="results-analysis">
            <h3>Your Personality Profile</h3>
            {/* <p className="section-description">Based on your quiz responses, here's your detailed personality analysis.</p> */}

            {/* Display personality scores if available */}
            {quizState?.data?.personality_scores && (
              <div className="personality-scores">
                {(() => {
                  const personalityData = typeof quizState.data.personality_scores === 'string'
                    ? JSON.parse(quizState.data.personality_scores)
                    : quizState.data.personality_scores;

                  return (
                    <div className="analysis-grid">
                      {/* Conscientiousness Score */}
                      {personalityData?.conscientiousness?.score && (
                        <div className="analysis-card">
                          <h4>Conscientiousness: {personalityData.conscientiousness.tag}</h4>
                          <p>
                            Score: {personalityData.conscientiousness.score}/5.0
                            <br />
                            {personalityData.conscientiousness.tag === 'High' && 'You demonstrate strong organization, reliability, and goal-oriented behavior.'}
                            {personalityData.conscientiousness.tag === 'Average' && 'You balance structure with flexibility in your approach to tasks.'}
                            {personalityData.conscientiousness.tag === 'Low' && 'You show a flexible, spontaneous approach to tasks and planning.'}
                          </p>
                        </div>
                      )}

                      {/* Openness Score (if available) */}
                      {personalityData?.openness?.score && (
                        <div className="analysis-card">
                          <h4>Openness: {personalityData.openness.tag}</h4>
                          <p>
                            Score: {personalityData.openness.score}/5.0
                            <br />
                            Your openness to new experiences and creative thinking.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Display RIASEC scores if available */}
            {quizState?.data?.riasec_scores && (
              <div className="riasec-scores">
                <h4>Your Interest Profile (RIASEC)</h4>
                <p className="section-description">Your vocational interests based on Holland's career theory:</p>
                {(() => {
                  const riasecData = typeof quizState.data.riasec_scores === 'string'
                    ? JSON.parse(quizState.data.riasec_scores)
                    : quizState.data.riasec_scores;

                  // Prepare data for radar chart - all 6 dimensions
                  const radarData = [
                    { dimension: 'Realistic', score: Number(riasecData.realistic || 0), fullName: 'Realistic - Hands-on, practical work' },
                    { dimension: 'Investigative', score: Number(riasecData.investigative || 0), fullName: 'Investigative - Research and analysis' },
                    { dimension: 'Artistic', score: Number(riasecData.artistic || 0), fullName: 'Artistic - Creative and expressive' },
                    { dimension: 'Social', score: Number(riasecData.social || 0), fullName: 'Social - Helping and teaching others' },
                    { dimension: 'Enterprising', score: Number(riasecData.enterprising || 0), fullName: 'Enterprising - Leadership and business' },
                    { dimension: 'Conventional', score: Number(riasecData.conventional || 0), fullName: 'Conventional - Organization and detail' }
                  ];

                  // Get top 3 for text summary
                  const sortedRiasec = Object.entries(riasecData || {})
                    .filter(([key, score]) => typeof score === 'number' || !isNaN(Number(score)))
                    .sort(([, a], [, b]) => Number(b) - Number(a))
                    .slice(0, 3);

                  return (
                    <div className="riasec-visualization">
                      <div className="riasec-chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                          <RadarChart data={radarData}>
                            <PolarGrid stroke="#e0e0e0" />
                            <PolarAngleAxis
                              dataKey="dimension"
                              tick={{ fontSize: 12, fill: '#1c1e22' }}
                            />
                            <PolarRadiusAxis
                              domain={[0, 4]}
                              tick={{ fontSize: 10, fill: '#1c1e22' }}
                              tickCount={5}
                            />

                            <Radar
                              dataKey="score"
                              stroke="#016a90"
                              fill="#016a90"
                              fillOpacity={0.25}
                              strokeWidth={2}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="riasec-summary">
                        <h5>Your Top Interests:</h5>
                        <div className="riasec-top-list">
                          {sortedRiasec.map(([key, score], index) => (
                            <div key={key} className="riasec-summary-item">
                              <span className="riasec-rank">#{index + 1}</span>
                              <span className="riasec-name">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                              <span className="riasec-score">{(Number(score) || 0).toFixed(1)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Fallback to placeholder if no enhanced data */}
            {/* {!quizState?.data?.brilliance_summary && !quizState?.data?.personality_scores && (
              <div className="analysis-grid">
                <div className="analysis-card">
                  <FiCheckCircle className="card-icon" />
                  <h4>Conscientiousness</h4>
                  <p>
                    Your responses to task-related questions suggest you differ in how you approach goals and organization.
                    (Detailed analysis available in full report)
                  </p>
                </div>

                <div className="analysis-card">
                  <FiUsers className="card-icon" />
                  <h4>Social & Teamwork</h4>
                  <p>
                    Your preferences indicate a unique balance between independence and collaboration.
                    (Detailed analysis available in full report)
                  </p>
                </div>
              </div>
            )} */}
          </div>

          {/* Program Matches Section */}
          <div className="recommendations">
            <h3>Your Top Program Matches</h3>

            {matchingLoading && (
              <div className="loading-state">
                <p>Finding your perfect program matches...</p>
              </div>
            )}

            {matchingError && (
              <div className="error-state">
                <p>Unable to load program matches: {matchingError}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="btn-secondary"
                >
                  Try Again
                </button>
              </div>
            )}

            {!matchingLoading && !matchingError && matchedPrograms.length > 0 && (
              <>
                {/* Cost Comparison Chart */}
                <CostComparisonChart programs={matchedPrograms.slice(0, 3)} />

                {/* Minimal Program Cards */}
                <h2 className="program-matches-title">YOUR TOP 3 MATCHES</h2>
                <div className="program-matches">
                  {matchedPrograms.slice(0, 3).map((program, index) => (
                    <div key={program.program_id} className="program-match-minimal">
                      <div className="match-info">
                        {/* <div className="match-rank">#{index + 1}</div> */}
                        <div className="program-info">
                          <h4>{program.program_name}</h4>
                          {program.program_image_url || program.university_logo_url ? <img
                            src={program.program_image_url || program.university_logo_url || ''}
                            alt={program.program_name}
                            className="program-image"
                          /> : <div className="program-image-placeholder"></div>}
                          <div className="program-meta">
                            <p className="university-name">{program.university_name}</p>
                            {/* <p className="degree-level">{program.degree_level}</p> */}
                          </div>
                        </div>
                      </div>

                      <div className="program-actions">
                        <button
                          type="button"
                          className="btn-primary btn-apply"
                          onClick={() =>
                            addProgram({
                              program_id: program.program_id,
                              id: program.program_id,
                              university_id: program.university_id
                            })
                          }
                        >
                          Add to My Applications
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {!matchingLoading && !matchingError && matchedPrograms.length === 0 && (
              <div className="no-matches">
                <p>No program matches found. Please try retaking the quiz or contact support.</p>
              </div>
            )}
          </div>

          <div className="results-actions">
            <Link to="/apply/intro" className="btn-primary">
              Application Hub
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizSummary;
