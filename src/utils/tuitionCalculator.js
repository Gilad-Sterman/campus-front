/**
 * Frontend Tuition Calculator Utility
 * Handles in-state vs out-of-state tuition logic for US universities
 */

/**
 * Calculate tuition and living costs based on user's selected state and university location
 * @param {string} userState - User's selected state code (e.g., 'CA', 'FL') or 'NOT_US'
 * @param {Object} university - University object with tuition and state data
 * @returns {Object} Calculated tuition data with status and savings
 */
export function calculateTuition(userState, university) {
  // Handle non-US universities (Israeli, Canadian, etc.)
  if (university.country !== 'United States') {
    return {
      tuition: university.rawUniversity?.tuition_avg_usd || university.tuition || 0,
      livingCost: university.rawUniversity?.living_cost_usd || university.cityLivingCost || 0,
      status: 'international',
      savings: 0,
      isInState: false,
      displayStatus: 'International Rate'
    };
  }

  // Handle users without state info or international users
  if (!userState || userState === 'NOT_US' || userState === 'International') {
    return {
      tuition: university.rawUniversity?.tuition_avg_usd || university.tuition || 0,
      livingCost: university.rawUniversity?.living_cost_usd || university.cityLivingCost || 0,
      status: 'out_of_state',
      savings: 0,
      isInState: false,
      displayStatus: 'Out-of-State'
    };
  }

  // Handle US universities with state matching
  const universityState = university.rawUniversity?.state_code;

  // Check if user's state matches university's state
  const isInState = userState === universityState;

  if (isInState && university.rawUniversity?.tuition_in_state_usd) {
    // User qualifies for in-state tuition
    const outOfStateTuition = university.rawUniversity.tuition_avg_usd || 0;
    const inStateTuition = university.rawUniversity.tuition_in_state_usd;
    const savings = outOfStateTuition - inStateTuition;

    return {
      tuition: inStateTuition,
      livingCost: university.rawUniversity.living_cost_in_state_usd || university.rawUniversity.living_cost_usd || 0,
      status: 'in_state',
      savings: savings > 0 ? savings : 0,
      isInState: true,
      displayStatus: 'In-State',
      outOfStateTuition: outOfStateTuition
    };
  } else {
    // User pays out-of-state tuition
    return {
      tuition: university.rawUniversity?.tuition_avg_usd || university.tuition || 0,
      livingCost: university.rawUniversity?.living_cost_usd || university.cityLivingCost || 0,
      status: 'out_of_state',
      savings: 0,
      isInState: false,
      displayStatus: 'Out-of-State',
      inStateTuition: university.rawUniversity?.tuition_in_state_usd || null
    };
  }
}

/**
 * Get tuition status display text with color coding
 * @param {string} status - Status from calculateTuition
 * @returns {Object} Display text and color class
 */
export function getTuitionStatusDisplay(status) {
  const statusMap = {
    'in_state': {
      text: 'In-State',
      color: 'success',
      bgColor: '#e8f5e8',
      textColor: '#2d5a2d'
    },
    'out_of_state': {
      text: 'Out-of-State',
      color: 'warning',
      bgColor: '#fff3cd',
      textColor: '#856404'
    },
    'international': {
      text: 'International Rate',
      color: 'info',
      bgColor: '#d1ecf1',
      textColor: '#0c5460'
    }
  };

  return statusMap[status] || statusMap['out_of_state'];
}

/**
 * Format savings amount for display
 * @param {number} savings - Annual savings amount
 * @returns {string} Formatted savings text
 */
export function formatSavings(savings) {
  if (!savings || savings <= 0) return '';
  
  if (savings >= 1000) {
    return `Save $${(savings / 1000).toFixed(0)}k/year`;
  }
  return `Save $${savings.toLocaleString()}/year`;
}

/**
 * Convert state name to state code
 * @param {string} stateName - Full state name (e.g., 'California')
 * @returns {string} State code (e.g., 'CA') or 'NOT_US'
 */
export function getStateCodeFromName(stateName) {
  const stateNameToCode = {
    'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
    'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
    'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
    'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
    'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
    'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
    'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
    'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
    'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
    'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY',
    'Washington D.C.': 'DC', 'International': 'NOT_US', 'Not from US': 'NOT_US'
  };

  return stateNameToCode[stateName] || 'NOT_US';
}

export default {
  calculateTuition,
  getTuitionStatusDisplay,
  formatSavings,
  getStateCodeFromName
};
