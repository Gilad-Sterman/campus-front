import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { FiDollarSign, FiHome, FiMapPin, FiBook, FiPlus, FiX, FiTrendingUp } from 'react-icons/fi';
import { universityApiService } from '../../services/universityApi';
import { calculateTuition, getStateCodeFromName } from '../../utils/tuitionCalculator';

const CostCalculator = () => {
  const { user } = useSelector(state => state.auth);
  const [university1, setUniversity1] = useState('');
  const [university2, setUniversity2] = useState('');
  const [usBenchmark, setUsBenchmark] = useState('');
  const [userRegion, setUserRegion] = useState('California');
  const [showResults, setShowResults] = useState(false);
  const [universities, setUniversities] = useState([]);
  const [travelCosts, setTravelCosts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const fetchStarted = useRef(false);

  // Load universities and travel costs on component mount
  useEffect(() => {
    const loadData = async () => {
      if (fetchStarted.current) return;
      fetchStarted.current = true;
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

  // Set user's state when data loads and user info is available
  useEffect(() => {
    if (user?.country && Object.keys(travelCosts).length > 0) {
      // If user has a state code, map it to full state name
      if (user.country !== 'NOT_US' && stateCodeToName[user.country]) {
        const stateName = stateCodeToName[user.country];
        // Check if this state exists in travel costs data
        if (travelCosts[stateName]) {
          setUserRegion(stateName);
        }
      }
      // If user selected "Not from US", set to International option
      else if (user.country === 'NOT_US') {
        // Set to International if it exists in travel costs
        if (travelCosts['International']) {
          setUserRegion('International');
        }
      }
    }
  }, [user, travelCosts]);

  const handleSearch = () => {
    if (university1 && university2) {
      setShowResults(true);
    }
  };

  const getUniversityById = (id) => {
    return universities.find(u => u.id === id);
  };

  const calculateCosts = (university) => {
    if (!university) return { tuition: 0, living: 0, travel: 0, total: 0 };

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

    const total = tuition + living + travel;

    return { tuition, living, travel, total, tuitionData };
  };

  const getAvailableUniversities2 = () => {
    return universities.filter(u => u.id !== university1 && !u.isUS);
  };

  const getIsraeliUniversities = () => {
    return universities.filter(u => !u.isUS);
  };

  const getUSUniversities = () => {
    return universities.filter(u => u.isUS);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="profile-section">
        {/* <div className="profile-section-header">
          <h1 className="profile-section-title">Cost Calculator</h1>
          <p className="profile-section-subtitle">
            Compare annual study costs between Israeli universities and US benchmarks
          </p>
        </div> */}
        <div className="profile-section-content">
          <div className="loading-state">Loading university data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-section">
        {/* <div className="profile-section-header">
          <h1 className="profile-section-title">Cost Calculator</h1>
          <p className="profile-section-subtitle">
            Compare annual study costs between Israeli universities and US benchmarks
          </p>
        </div> */}
        <div className="profile-section-content">
          <div className="error-state">
            <p>{error}</p>
            <button
              className="btn-primary"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-section">
      {/* <div className="profile-section-header">
        <h1 className="profile-section-title">Cost Calculator</h1>
        <p className="profile-section-subtitle">
          Compare annual study costs between Israeli universities and US benchmarks
        </p>
      </div>
       */}
      <div className="profile-section-content">
        <div className="cost-calculator">
          {/* Explanation Section */}
          <div className="cost-explanation">
            <h2>How it’s calculated?</h2>
            <div className="explanation-grid">
              <div className="explanation-item">
                <div>
                  <p>
                    Compare what you'd pay at home versus at
                    an Israeli university in seconds, then get a
                    full cost breakdown that is personalized to
                    your situation.
                  </p>
                </div>
              </div>
              <div className="explanation-item">
                <div>
                  <p>
                    Every number is backed by real data so you
                    can plan with clarity, not assumptions.
                  </p>
                </div>
              </div>
              <div className="explanation-item">
                <div>
                  <strong>Tuition & Fees</strong>
                  <p>This cost reflects the yearly tuition cost for
                    the selected university. Specific tuition fees
                    for each program vary, therefore this cost
                    sums an average for the university.</p>
                </div>
              </div>
              <div className="explanation-item">
                <div>
                  <strong>Living Expenses</strong>
                  <p>Calculation based on the average living
                    expenses for the city the university is located
                    in.</p>
                </div>
              </div>
              <div className="explanation-item">
                <div>
                  <strong>Travel</strong>
                  <p>This cost is calculated based on the average
                    flight ticket cost from the home country or
                    state designated in the Hub sign up and
                    reflects one international trip a year.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Selection Panel */}
          <div className="selection-panel">
            <h3>Cost Calculator</h3>
            <div className="selection-row">
              <div className="selection-group">
                <label className="selection-label">Your Location</label>
                <select
                  value={userRegion}
                  onChange={(e) => setUserRegion(e.target.value)}
                  className="selection-dropdown max"
                >
                  {Object.keys(travelCosts).map(region => (
                    <option key={region} value={region}>
                      {region === 'International' ? 'Not from US' : region}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="selection-row">
              <div className="selection-group">
                <label className="selection-label">University 1 *</label>
                <select
                  value={university1}
                  onChange={(e) => setUniversity1(e.target.value)}
                  className="selection-dropdown"
                >
                  <option value="">Select Israeli University</option>
                  {getIsraeliUniversities().map(uni => (
                    <option key={uni.id} value={uni.id}>
                      {uni.name} - {uni.city}
                    </option>
                  ))}
                </select>
              </div>

              <div className="selection-group">
                <label className="selection-label">University 2 *</label>
                <select
                  value={university2}
                  onChange={(e) => setUniversity2(e.target.value)}
                  className="selection-dropdown"
                >
                  <option value="">Select Israeli University</option>
                  {getAvailableUniversities2().map(uni => (
                    <option key={uni.id} value={uni.id}>
                      {uni.name} - {uni.city}
                    </option>
                  ))}
                </select>
              </div>

              <div className="selection-group">
                <label className="selection-label">US Benchmark (Optional)</label>
                <select
                  value={usBenchmark}
                  onChange={(e) => setUsBenchmark(e.target.value)}
                  className="selection-dropdown"
                >
                  <option value="">Select US Benchmark</option>
                  {getUSUniversities().map(uni => (
                    <option key={uni.id} value={uni.id}>
                      {uni.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                className="search-btn"
                onClick={handleSearch}
                disabled={!university1 || !university2}
              >
                Check Cost
              </button>
            </div>

            <div className="search-section">
            </div>
          </div>
          {/* Results Table */}
          {showResults && (
            <div className="results-table-container">
              <div className="comparison-table">
                <table>
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>{getUniversityById(university1)?.name}</th>
                      <th>{getUniversityById(university2)?.name}</th>
                      {usBenchmark && <th className='white'>{getUniversityById(usBenchmark)?.name}</th>}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="category-cell">
                        Tuition & Fees
                      </td>
                      <td>{formatCurrency(calculateCosts(getUniversityById(university1)).tuition)}</td>
                      <td>{formatCurrency(calculateCosts(getUniversityById(university2)).tuition)}</td>
                      {usBenchmark && <td className='white'>{formatCurrency(calculateCosts(getUniversityById(usBenchmark)).tuition)}</td>}
                    </tr>
                    <tr>
                      <td className="category-cell">
                        Living Expenses
                      </td>
                      <td>{formatCurrency(calculateCosts(getUniversityById(university1)).living)}</td>
                      <td>{formatCurrency(calculateCosts(getUniversityById(university2)).living)}</td>
                      {usBenchmark && <td className='white'>{formatCurrency(calculateCosts(getUniversityById(usBenchmark)).living)}</td>}
                    </tr>
                    <tr>
                      <td className="category-cell">
                        Travel
                      </td>
                      <td>{formatCurrency(calculateCosts(getUniversityById(university1)).travel)}</td>
                      <td>{formatCurrency(calculateCosts(getUniversityById(university2)).travel)}</td>
                      {usBenchmark && <td className='white'>{formatCurrency(calculateCosts(getUniversityById(usBenchmark)).travel)}</td>}
                    </tr>
                    <tr className="total-row">
                      <td className="category-cell total-category">
                        <strong>Total Annual Cost</strong>
                      </td>
                      <td className="total-cell">{formatCurrency(calculateCosts(getUniversityById(university1)).total)}</td>
                      <td className="total-cell">{formatCurrency(calculateCosts(getUniversityById(university2)).total)}</td>
                      {usBenchmark && <td className="total-cell white">{formatCurrency(calculateCosts(getUniversityById(usBenchmark)).total)}</td>}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Quick Insights */}
              {/* <div className="quick-insights">
                <h4>Quick Insights</h4>
                <div className="insights-list">
                  {(() => {
                    const uni1Costs = calculateCosts(getUniversityById(university1));
                    const uni2Costs = calculateCosts(getUniversityById(university2));
                    const cheaperUni = uni1Costs.total < uni2Costs.total ? getUniversityById(university1) : getUniversityById(university2);
                    const savings = Math.abs(uni1Costs.total - uni2Costs.total);

                    return (
                      <div className="insight-item">
                        <FiTrendingUp className="insight-icon" />
                        <p>
                          <strong>{cheaperUni?.name}</strong> is ${formatCurrency(savings).replace('$', '')} cheaper annually
                        </p>
                      </div>
                    );
                  })()}

                  {usBenchmark && (() => {
                    const usCosts = calculateCosts(getUniversityById(usBenchmark));
                    const avgIsraeliCosts = (calculateCosts(getUniversityById(university1)).total + calculateCosts(getUniversityById(university2)).total) / 2;
                    const savings = usCosts.total - avgIsraeliCosts;

                    return (
                      <div className="insight-item">
                        <FiDollarSign className="insight-icon" />
                        <p>
                          Israeli universities save an average of <strong>{formatCurrency(savings)}</strong> compared to US options
                        </p>
                      </div>
                    );
                  })()}
                </div>
              </div> */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CostCalculator;
