import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import applicationApiService from '../../services/applicationApi';

const BasicInfoForm = ({ onNext, onSave, initialData }) => {
  const { user } = useSelector(state => state.auth);
  const { quizResults } = useSelector(state => state.quiz);

  const [formData, setFormData] = useState({
    current_education_level: initialData?.current_education_level || '',
    gpa: initialData?.gpa || '',
    primary_major: initialData?.primary_major || '',
    primary_university: initialData?.primary_university || '',
    hebrew_proficiency: initialData?.hebrew_proficiency || '',
    been_to_israel: initialData?.been_to_israel || ''
  });

  const [programs, setPrograms] = useState([]);
  const [filteredUniversities, setFilteredUniversities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [applicationId, setApplicationId] = useState(null);

  // Load programs on mount - only if not already loaded
  useEffect(() => {
    if (programs.length === 0) {
      loadPrograms();
    }
  }, [programs.length]);

  // Update form data when initialData changes (only once)
  useEffect(() => {
    if (initialData && initialData.primary_major && programs.length > 0) {
      const newFormData = {
        current_education_level: initialData.current_education_level || '',
        gpa: initialData.gpa || '',
        primary_major: initialData.primary_major || '',
        primary_university: initialData.primary_university || '',
        hebrew_proficiency: initialData.hebrew_proficiency || '',
        been_to_israel: initialData.been_to_israel || ''
      };
      setFormData(newFormData);

      // Store application ID if it exists (for continuing existing applications)
      if (initialData.id) {
        setApplicationId(initialData.id);
      }

      // Filter universities for the selected program
      filterUniversitiesForProgram(initialData.primary_major);
    }
  }, [initialData?.primary_major, programs.length]); // Only depend on program ID and programs length

  // Pre-fill from quiz results if available
  useEffect(() => {
    if (quizResults && quizResults.recommendations) {
      const topRecommendations = quizResults.recommendations.slice(0, 6);
      // Pre-fill with top recommendation if no existing data
      if (!formData.primary_major && topRecommendations.length > 0) {
        setFormData(prev => ({
          ...prev,
          primary_major: topRecommendations[0].program_id
        }));
      }
    }
  }, [quizResults]);

  // Auto-save on form changes (but not during initial pre-filling)
  useEffect(() => {
    // Don't auto-save if this is the initial pre-fill from URL params and no other fields are filled
    if (initialData?.source === 'intro' &&
      !formData.current_education_level &&
      !formData.hebrew_proficiency &&
      !formData.been_to_israel) {
      return;
    }

    const timeoutId = setTimeout(() => {
      if (formData.primary_major && formData.primary_university) {
        handleAutoSave();
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [formData]);

  const loadPrograms = async () => {
    try {
      const response = await applicationApiService.getPrograms();
      setPrograms(response.data || []);
    } catch (error) {
      console.error('Error loading programs:', error);
    }
  };


  const handleAutoSave = async () => {
    try {
      await applicationApiService.updateApplicationInfo(formData);
      if (onSave) onSave(formData);
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear related errors
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }

    // When program changes, filter universities and clear university selection if it's a manual change
    if (field === 'primary_major') {
      filterUniversitiesForProgram(value);
      // Clear university selection when program changes manually
      setFormData(prev => ({ ...prev, primary_university: '' }));
    }
  };

  const getUniquePrograms = () => {
    const uniquePrograms = [];
    const seenPrograms = new Set();

    programs.forEach(program => {
      const programKey = `${program.name}-${program.degree_level}`;
      if (!seenPrograms.has(programKey)) {
        seenPrograms.add(programKey);

        // Find the specific program ID that matches our pre-filled data if available
        let programToUse = program;
        if (formData.primary_major) {
          const matchingProgram = programs.find(p =>
            p.id === formData.primary_major &&
            p.name === program.name &&
            p.degree_level === program.degree_level
          );
          if (matchingProgram) {
            programToUse = matchingProgram;
          }
        }

        uniquePrograms.push({
          ...programToUse,
          displayName: `${programToUse.name} (${programToUse.degree_level})`
        });
      }
    });


    return uniquePrograms;
  };

  const filterUniversitiesForProgram = (selectedProgramId) => {
    if (!selectedProgramId) {
      setFilteredUniversities([]);
      return;
    }

    // Find the selected program to get its name and degree level
    const selectedProgram = programs.find(p => p.id === selectedProgramId);

    if (!selectedProgram) {
      setFilteredUniversities([]);
      return;
    }

    // Find all programs with the same name and degree level
    const matchingPrograms = programs.filter(p =>
      p.name === selectedProgram.name && p.degree_level === selectedProgram.degree_level
    );

    // Get unique universities from these programs
    const universitiesForProgram = [];
    const seenUniversities = new Set();

    matchingPrograms.forEach(program => {
      if (program.university && !seenUniversities.has(program.university.id)) {
        seenUniversities.add(program.university.id);
        universitiesForProgram.push({
          ...program.university,
          programId: program.id // Store the specific program ID for this university
        });
      }
    });

    setFilteredUniversities(universitiesForProgram);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.primary_major) {
      newErrors.primary_major = 'Primary academic interest is required';
    }
    if (!formData.primary_university) {
      newErrors.primary_university = 'University selection is required';
    }
    if (!formData.current_education_level) {
      newErrors.current_education_level = 'Current education level is required';
    }
    if (!formData.hebrew_proficiency) {
      newErrors.hebrew_proficiency = 'Hebrew proficiency is required';
    }
    if (!formData.been_to_israel) {
      newErrors.been_to_israel = 'Please indicate if you have been to Israel';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Check for existing application first (but skip if we're continuing an existing application)
      if (formData.primary_major && formData.primary_university && !applicationId) {
        const statusResponse = await applicationApiService.getApplicationStatus(
          formData.primary_major,
          formData.primary_university
        );

        if (statusResponse.data) {
          // Check if this is a completed application (not a draft from auto-save)
          if (statusResponse.data.status !== 'draft') {
            setErrors({
              submit: `You have already applied to this program at this university. Please continue your existing application from "My Applications" or select a different program/university combination.`
            });
            setLoading(false);
            return;
          } else {
            // If it's a draft, we can continue with this application (likely from auto-save)
            setApplicationId(statusResponse.data.id);
          }
        }
      }

      // Include the application ID in the form data if we're continuing an existing application
      const formDataToSubmit = applicationId ? { ...formData, id: applicationId } : formData;

      const response = await applicationApiService.updateApplicationInfo(formDataToSubmit);

      // Include the application ID in the form data
      // Backend returns {success: true, data: applicationData}, so ID is at response.data.data.id
      const formDataWithId = {
        ...formData,
        id: response.data?.data?.id || response.data?.id || applicationId
      };

      if (onNext) onNext(formDataWithId);
    } catch (error) {
      console.error('Error saving application info:', error);

      // Check if it's a duplicate application error
      if (error.message && error.message.includes('duplicate key value violates unique constraint')) {
        setErrors({ submit: 'You have already applied to this program at this university. Please select a different program or university, or continue your existing application from "My Applications".' });
      } else {
        setErrors({ submit: 'Failed to save application information. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="basic-info-form">
      <div className="form-header">
        <h2>Basic Information</h2>
        <p>Tell us about your academic background and interests</p>
      </div>

      <form onSubmit={handleSubmit} className="application-form">
        <h3>Your Interest</h3>
        <div className='form-row'>
          {/* Primary Academic Interest */}
          <div className="form-group">
            <label htmlFor="primary-major">Primary Academic Interest *</label>
            <select
              id="primary-major"
              key={`program-${formData.primary_major}-${programs.length}`}
              value={formData.primary_major || ''}
              onChange={(e) => handleInputChange('primary_major', e.target.value)}
              className={errors.primary_major ? 'error' : ''}
            >
              <option value="">Select your primary interest</option>
              {getUniquePrograms().map(program => (
                <option key={program.id} value={program.id}>
                  {program.displayName}
                </option>
              ))}
            </select>
            {errors.primary_major && (
              <span className="error-message">{errors.primary_major}</span>
            )}
          </div>

          {/* University Selection */}
          <div className="form-group">
            <label htmlFor="primary-university">University *</label>
            <select
              id="primary-university"
              value={formData.primary_university}
              onChange={(e) => {
                // Find the selected university and get its specific program ID
                const selectedUni = filteredUniversities.find(u => u.id === e.target.value);
                if (selectedUni) {
                  // Update both university and the specific program ID for this university
                  setFormData(prev => ({
                    ...prev,
                    primary_university: e.target.value,
                    primary_major: selectedUni.programId
                  }));
                }
              }}
              className={errors.primary_university ? 'error' : ''}
              disabled={!formData.primary_major}
            >
              <option value="">Select university</option>
              {filteredUniversities.map(university => (
                <option key={university.id} value={university.id}>
                  {university.name} - {university.city}
                </option>
              ))}
            </select>
            {errors.primary_university && (
              <span className="error-message">{errors.primary_university}</span>
            )}
          </div>
        </div>
        {/* Current Education Level */}
        <h3>Your Education</h3>
        <div className='form-row'>
          <div className="form-group">
            <label htmlFor="education-level">Current Education Level *</label>
            <select
              id="education-level"
              value={formData.current_education_level}
              onChange={(e) => handleInputChange('current_education_level', e.target.value)}
              className={errors.current_education_level ? 'error' : ''}
            >
              <option value="">Select your current level</option>
              <option value="high_school">High School</option>
              <option value="bachelor">Bachelor's Degree</option>
              <option value="master">Master's Degree</option>
              <option value="phd">PhD</option>
              <option value="other">Other</option>
            </select>
            {errors.current_education_level && (
              <span className="error-message">{errors.current_education_level}</span>
            )}
          </div>

          {/* GPA */}
          <div className="form-group">
            <label htmlFor="gpa">GPA (Optional)</label>
            <input
              type="number"
              id="gpa"
              min="0"
              max="4"
              step="0.1"
              value={formData.gpa}
              onChange={(e) => handleInputChange('gpa', e.target.value)}
              placeholder="e.g., 3.5"
            />
          </div>
        </div>
        <h3>Connection to Israel</h3>
        {/* Hebrew Proficiency */}
        <div className="form-group">
          <label>Hebrew Proficiency *</label>
          <div className="radio-group">
            {['none', 'basic', 'fluent'].map(level => (
              <label key={level} className="radio-option">
                <input
                  type="radio"
                  name="hebrew_proficiency"
                  value={level}
                  checked={formData.hebrew_proficiency === level}
                  onChange={(e) => handleInputChange('hebrew_proficiency', e.target.value)}
                />
                <span>{level.charAt(0).toUpperCase() + level.slice(1)}</span>
              </label>
            ))}
          </div>
          {errors.hebrew_proficiency && (
            <span className="error-message">{errors.hebrew_proficiency}</span>
          )}
        </div>

        {/* Been to Israel Before */}
        <div className="form-group">
          <label>Have you been to Israel before? *</label>
          <div className="radio-group">
            {['yes', 'no'].map(option => (
              <label key={option} className="radio-option">
                <input
                  type="radio"
                  name="been_to_israel"
                  value={option}
                  checked={formData.been_to_israel === option}
                  onChange={(e) => handleInputChange('been_to_israel', e.target.value)}
                />
                <span>{option.charAt(0).toUpperCase() + option.slice(1)}</span>
              </label>
            ))}
          </div>
          {errors.been_to_israel && (
            <span className="error-message">{errors.been_to_israel}</span>
          )}
        </div>
        {/* Submit Error */}
        {errors.submit && (
          <div className="error-message submit-error">{errors.submit}</div>
        )}

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Next'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BasicInfoForm;
