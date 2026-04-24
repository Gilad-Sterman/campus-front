import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAddToMyApplications, shouldShowAddedState } from '../hooks/useAddToMyApplications';
import { FiTarget, FiSearch, FiArrowRight } from 'react-icons/fi';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import programMatchingApi from '../services/programMatchingApi';
import CostComparisonChart from '../components/common/CostComparisonChart';
import SimplePieChart from '../components/common/SimplePieChart';
import universityApiService from '../services/universityApi';
import { calculateTuition, getStateCodeFromName } from '../utils/tuitionCalculator';

const QuizResultsPage = () => {
    const { addProgram } = useAddToMyApplications();
    const { quizState, user } = useSelector(state => state.auth);
    const [matchedPrograms, setMatchedPrograms] = useState([]);
    const [matchingLoading, setMatchingLoading] = useState(false);
    const [matchingError, setMatchingError] = useState(null);
    const [visibleCount, setVisibleCount] = useState(3);
    const [addedProgramIds, setAddedProgramIds] = useState(() => new Set());
    const [universities, setUniversities] = useState([]);
    const [travelCosts, setTravelCosts] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check if quiz is completed using auth metadata
    const hasCompletedQuiz = quizState?.data?.status === 'completed';

    // Get answers from auth.quizState.data.answers
    const answers = quizState?.data?.answers || [];

    // Create a map for easier access
    const answerMap = Array.isArray(answers) ? answers.reduce((acc, curr) => {
        acc[curr.questionId] = curr.answer;
        return acc;
    }, {}) : {};

    // Get section weights from enhanced scoring data
    const getSectionWeights = () => {
        // V3 specific weights
        const v3Data = quizState?.data?.scoring?.v3?.weights || quizState?.data?.v3_data?.weights || quizState?.data?.v3?.weights || quizState?.data?.section_weights;
        if (v3Data && (v3Data.academic || v3Data.environment || (v3Data.weights && (v3Data.weights.academic || v3Data.weights.environment)))) {
            const weights = v3Data.weights || v3Data;
            return {
                academic: Math.round((weights.academic?.weight || weights.academic || 0) * (weights.academic < 1 ? 100 : 1)),
                environment: Math.round((weights.environment?.weight || weights.environment || 0) * (weights.environment < 1 ? 100 : 1))
            };
        }

        // Legacy/V1 calculations
        if (quizState?.data?.section_weights) {
            const sectionData = typeof quizState.data.section_weights === 'string'
                ? JSON.parse(quizState.data.section_weights)
                : quizState.data.section_weights;

            return {
                degree: sectionData?.degree?.weight || sectionData?.degree || 40,
                campus: sectionData?.campus?.weight || sectionData?.campus || 30,
                city: sectionData?.city?.weight || sectionData?.city || 30
            };
        }

        // Fallback for V1
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

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [universitiesResponse, travelResponse] = await Promise.all([
                    universityApiService.getUniversitiesWithCosts(),
                    universityApiService.getTravelCosts()
                ]);

                setUniversities(universitiesResponse.data || []);
                setTravelCosts(travelResponse.data || {});
                setError(null);
            } catch (err) {
                console.error('Error loading cost calculator data:', err);
                setError('Failed to load university data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const getUniversityById = (id) => {
        return universities.find(u => u.id === id);
    };

    // Mapping from state codes to full state names (for travel costs)
    const stateCodeToName = {
        'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
        'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
        'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
        'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
        'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
        'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
        'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
        'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
        'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
        'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming',
        'DC': 'Washington D.C.'
    };

    // Get user's region for travel cost calculation
    const getUserRegion = () => {
        if (user?.country && Object.keys(travelCosts).length > 0) {
            // If user has a state code, map it to full state name
            if (user.country !== 'NOT_US' && stateCodeToName[user.country]) {
                const stateName = stateCodeToName[user.country];
                // Check if this state exists in travel costs data
                if (travelCosts[stateName]) {
                    return stateName;
                }
            }
            // If user selected "Not from US", set to International option
            else if (user.country === 'NOT_US') {
                // Set to International if it exists in travel costs
                if (travelCosts['International']) {
                    return 'International';
                }
            }
        }
        // Default to California if no user state or travel costs not loaded
        return 'California';
    };

    // Extract unique universities from matched programs
    const getUniqueUniversities = () => {
        if (!matchedPrograms.length || !universities.length) return [];

        const uniqueUniversityNames = [...new Set(matchedPrograms.map(program => program.university_name))];
        return uniqueUniversityNames.map(name =>
            universities.find(u => u.name === name)
        ).filter(Boolean);
    };

    // Calculate costs for a university
    const calculateCosts = (university) => {
        if (!university) return { tuition: 0, living: 0, travel: 0, total: 0 };

        const userRegion = getUserRegion();
        // Get user's selected state code
        const userStateCode = getStateCodeFromName(userRegion);

        // Calculate tuition based on selected state and university
        const tuitionData = calculateTuition(userStateCode, university);

        const tuition = tuitionData.tuition;
        const living = tuitionData.livingCost;

        // Calculate travel costs based on user's location and university location
        let travel = 0;
        if (!university.isUS) {
            // For Israeli universities, use travel costs from user's region
            travel = travelCosts[userRegion] || 1000;
        }
        // For US universities, no travel cost (assuming domestic)

        const total = user?.id ? tuition + living + travel : tuition;
        // const total = tuition + living + travel;

        return { tuition, living, travel, total, tuitionData };
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    if (!hasCompletedQuiz) {
        return (
            <div className='quiz-results-page'>
                <div className="profile-section">
                    <div className="profile-section-content">
                        <div className="no-quiz-results">
                            <h3>No Quiz Results Found</h3>
                            <p>
                                Take our quick assessment to get personalized program recommendations
                                and discover the best universities for your goals.
                            </p>

                            <div className="quiz-cta">
                                <Link to="/quiz" className="btn-primary">
                                    <FiTarget size={16} /> Start Quiz
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }


    return (
        <div className="quiz-results-page">
            <div className="results-page-content">
                <div className="quiz-results">
                    <div className="results-summary">
                        <div className="summary-header">
                            <div>
                                <h2>YOUR RESULTS</h2>
                            </div>
                        </div>
                    </div>

                    <div className="results-analysis">
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
                                    data={Object.entries(priorities).map(([key, value]) => ({
                                        label: key,
                                        value: Number(value || 0)
                                    }))}
                                    colors={{
                                        degree: '#028ec1ff',
                                        campus: '#016a90ff',
                                        city: '#094358ff',
                                        academic: '#028ec1ff',
                                        environment: '#016a90ff'
                                    }}
                                />
                            </div>
                            <div className="priorities-grid" style={{ width: '100%', gridTemplateColumns: 'repeat(3, 1fr)' }}>
                                {Object.entries(priorities).map(([key, value]) => (
                                    <div key={key} className="priority-card">
                                        <div style={{ width: '12px', height: '12px', backgroundColor: key === 'degree' ? '#028ec1ff' : key === 'campus' ? '#016a90ff' : '#094358ff', borderRadius: '50%', margin: '0 auto 0.5rem' }}></div>
                                        <div className="priority-value">{value}%</div>
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
                                                            domain={[0, 5]}
                                                            tick={{ fontSize: 10, fill: '#1c1e22' }}
                                                            tickCount={6}
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


                            </>
                        )}

                        {!matchingLoading && !matchingError && matchedPrograms.length === 0 && (
                            <div className="no-matches">
                                <p>No program matches found.</p>
                            </div>
                        )}
                    </div>


                </div>
                <section className='under'>
                    {!matchingLoading && !matchingError && matchedPrograms.length > 0 && (
                        <>
                            {/* Minimal Program Cards */}
                            <h2>YOUR TOP MATCHES</h2>
                            <div className="program-matches">
                                {matchedPrograms.slice(0, visibleCount).map((program, index) => (
                                    <div key={program.program_id} className="program-match-minimal">
                                        <div className="match-info">
                                            {/* <div className="match-rank">#{index + 1}</div> */}
                                            <div className="program-info">
                                                <h4>{program.program_name}</h4>
                                                {program.program_image_url || program.university_logo_url ? <img
                                                    src={program.program_image_url || program.university_logo_url || ''}
                                                    alt={program.program_name}
                                                    className='program-image'
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
                                                disabled={addedProgramIds.has(program.program_id)}
                                                onClick={async () => {
                                                    const result = await addProgram({
                                                        program_id: program.program_id,
                                                        id: program.program_id,
                                                        university_id: program.university_id
                                                    });
                                                    if (shouldShowAddedState(result)) {
                                                        setAddedProgramIds((prev) => new Set(prev).add(program.program_id));
                                                    }
                                                }}
                                            >
                                                {addedProgramIds.has(program.program_id) ? 'Added ✓' : 'Add to My Applications'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {visibleCount < matchedPrograms.length && (
                                <div className="show-more-container">
                                    <button 
                                        className="btn-secondary show-more-btn"
                                        onClick={() => setVisibleCount(prev => Math.min(prev + 3, 9))}
                                    >
                                        Show More Matches <FiArrowRight style={{ marginLeft: '8px' }} />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                    <div className="results-actions">
                        <Link to="/apply/intro" className="btn-primary">
                            Application Hub
                        </Link>
                    </div>
                    {/* Cost Comparison Table */}
                    {!matchingLoading && !matchingError && matchedPrograms.length > 0 && (
                        <div className='compare-table'>
                            <div className="results-table-container">
                                <h2>{user?.id ? 'Costs Comparison' : 'Tuition Comparison'}</h2>
                                <div className="comparison-table">
                                    {(() => {
                                        const uniqueUniversities = getUniqueUniversities();

                                        // Only show table if we have universities and cost data
                                        if (uniqueUniversities.length === 0 || loading || Object.keys(travelCosts).length === 0) {
                                            return <div className="loading-state">Loading cost comparison...</div>;
                                        }

                                        return (
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th>Category</th>
                                                        {uniqueUniversities.map((university, index) => (
                                                            <th key={university.id}>
                                                                {university.name}
                                                            </th>
                                                        ))}
                                                        <th className='white'>Average US University</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {user?.id && <tr>
                                                        <td className="category-cell">
                                                            Tuition & Fees
                                                        </td>
                                                        {uniqueUniversities.map((university) => {
                                                            const costs = calculateCosts(university);
                                                            return (
                                                                <td key={university.id}>
                                                                    {formatCurrency(costs.tuition)}
                                                                </td>
                                                            );
                                                        })}
                                                        <td className='white'>$40,000</td>
                                                    </tr>}
                                                    {user?.id && <tr>
                                                        <td className="category-cell">
                                                            Living Expenses
                                                        </td>
                                                        {uniqueUniversities.map((university) => {
                                                            const costs = calculateCosts(university);
                                                            return (
                                                                <td key={university.id}>
                                                                    {formatCurrency(costs.living)}
                                                                </td>
                                                            );
                                                        })}
                                                        <td className='white'>$15,000</td>
                                                    </tr>}
                                                    {user?.id && <tr>
                                                        <td className="category-cell">
                                                            Travel
                                                        </td>
                                                        {uniqueUniversities.map((university) => {
                                                            const costs = calculateCosts(university);
                                                            return (
                                                                <td key={university.id}>
                                                                    {formatCurrency(costs.travel)}
                                                                </td>
                                                            );
                                                        })}
                                                        <td className='white'>$1,500</td>
                                                    </tr>}
                                                    <tr className="total-row">
                                                        <td className="category-cell total-category">
                                                            <strong>{user?.id ? 'Total Annual Cost' : 'Tuition & Fees'}</strong>
                                                        </td>
                                                        {uniqueUniversities.map((university) => {
                                                            const costs = calculateCosts(university);
                                                            return (
                                                                <td key={university.id} className="total-cell">
                                                                    {formatCurrency(costs.total)}
                                                                </td>
                                                            );
                                                        })}
                                                        <td className="total-cell white">{user?.id ? '$56,500' : '$40,000'}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Campus Israel Journey Progress */}
                    <div className="journey-progress">
                        <h2>YOUR CAMPUS ISRAEL JOURNEY</h2>
                        <div className="progress-container">
                            <div className="progress-bar">
                                <div className="progress-fill"></div>
                            </div>
                            <div className="progress-steps">
                                <div className="progress-step completed">
                                    <div className="step-icon">✓</div>
                                    <div className="step-label">Register</div>
                                </div>
                                <div className="progress-step current">
                                    <div className="step-icon">✓</div>
                                    <div className="step-label">Take the Quiz</div>
                                </div>
                                <div className="progress-step pending">
                                    <div className="step-icon"></div>
                                    <Link className="step-label" to={'/apply/intro'}>My Applications</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default QuizResultsPage;
