import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getPublicUniversityDetails } from '../store/actions/appActions';
import searchApi from '../services/searchApi';
import { useAddToMyApplications, shouldShowAddedState } from '../hooks/useAddToMyApplications';

const UniversityDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [university, setUniversity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [programsLoading, setProgramsLoading] = useState(false);
  const [showAddedForSelection, setShowAddedForSelection] = useState(false);
  const { addProgram } = useAddToMyApplications();

  useEffect(() => {
    const loadUniversityDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const universityData = await dispatch(getPublicUniversityDetails(id));

        // Check if university exists and is active
        if (!universityData.data || universityData.data.status !== 'active') {
          setError('University not found or is not currently active.');
          return;
        }

        setUniversity(universityData.data);

        // Load programs for this university
        await loadUniversityPrograms(id);
      } catch (error) {
        console.error('Failed to load university details:', error);
        setError('Failed to load university details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    const loadUniversityPrograms = async (universityId) => {
      try {
        setProgramsLoading(true);
        const response = await searchApi.searchPrograms('', { university_id: universityId, status: 'active' });
        setPrograms(response.data.raw_results || []);
      } catch (error) {
        console.error('Failed to load programs:', error);
        setPrograms([]);
      } finally {
        setProgramsLoading(false);
      }
    };

    if (id) {
      loadUniversityDetails();
    }
  }, [id, dispatch]);

  if (loading) {
    return (
      <div className="university-details-page">
        <div className="university-loading">
          Loading university details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="university-details-page">
        <div className="university-container">
          <div className="error-state">
            <h2>Error</h2>
            <p>{error}</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/')}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!university) {
    return (
      <div className="university-details-page">
        <div className="university-container">
          <div className="error-state">
            <h2>University Not Found</h2>
            <p>The university you're looking for could not be found.</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/')}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const defaultLogo = '/campus_logo1.jpeg';

  // Handle program selection
  const handleProgramSelect = (program) => {
    setSelectedProgram(program);
    setShowDropdown(false);
    setShowAddedForSelection(false);
  };

  const handleMoreInfo = () => {
    if (!selectedProgram) return;
    const programDetailsUrl = `/program/${selectedProgram.id}`;
    window.open(programDetailsUrl, '_blank');
  };

  const handleAddToMyApplications = async () => {
    if (!selectedProgram || !university?.id) return;
    const result = await addProgram({
      ...selectedProgram,
      university_id: selectedProgram.university_id ?? university.id
    });
    if (shouldShowAddedState(result)) {
      setShowAddedForSelection(true);
    }
  };

  return (
    <div className="university-details-page">
      {/* Hero Section */}
      <div className="university-hero">
        <section className='top'>
          {/* University Logo above University Image */}
          {university.logo_url && (
            <div className="university-logo">
              <img
                src={university.logo_url}
                alt={`${university.name} logo`}
                onError={(e) => {
                  e.target.src = defaultLogo;
                }}
              />
            </div>
          )}
          <h1 className="university-hero-title">{university.name}</h1>
        </section>
        {/* University Image */}
        <div className="university-hero-image">
          <img
            src={university.university_images && university.university_images.length > 0 ? university.university_images[0] : 'https://mzyjtmyoxpsnnxsvucup.supabase.co/storage/v1/object/public/university-logos/GettyImages-2248592663.jpg'}
            alt={`${university.name} campus`}
          />
        </div>

        <section className='bottom'>

          <h2>{university.city}, {university.region || 'Israel'}</h2>
          {/* Visit Us Button */}
          {university.website_url && (
            <div className="university-visit-btn">
              <a
                href={university.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Visit Us
              </a>
            </div>
          )}
        </section>
        {/* Global Recognition */}
        {university.global_recognition && (
          <p className="university-hero-subtitle">{university.global_recognition}</p>
        )}


      </div>

      <div className="university-container">
        {/* Informational Content */}
        <div className="university-content">
          {/* Description */}
          {university.description && (
            <div className="university-section">
              <h2 className="university-section-title">About {university.name}</h2>
              <p className="university-section-text">{university.description}</p>
            </div>
          )}

          {/* More About Us */}
          {university.more_about && (
            <div className="university-section">
              <h2 className="university-section-title">More About Us</h2>
              <p className="university-section-text">{university.more_about}</p>
            </div>
          )}

          {/* Tuition Information */}
          {(university.tuition_bachelor_min || university.tuition_bachelor_max || university.tuition_master_min || university.tuition_master_max) && (
            <div className="university-section">
              <h2 className="university-section-title">Tuition Information</h2>
              <div className="tuition-ranges">
                {(university.tuition_bachelor_min || university.tuition_bachelor_max) && (
                  <div className="tuition-item">
                    <h3>Bachelor's Programs</h3>
                    <p>
                      {university.tuition_bachelor_min && university.tuition_bachelor_max
                        ? `$${university.tuition_bachelor_min.toLocaleString()} - $${university.tuition_bachelor_max.toLocaleString()} USD per year`
                        : university.tuition_bachelor_min
                          ? `From $${university.tuition_bachelor_min.toLocaleString()} USD per year`
                          : `Up to $${university.tuition_bachelor_max.toLocaleString()} USD per year`
                      }
                    </p>
                  </div>
                )}
                {(university.tuition_master_min || university.tuition_master_max) && (
                  <div className="tuition-item">
                    <h3>Master's Programs</h3>
                    <p>
                      {university.tuition_master_min && university.tuition_master_max
                        ? `$${university.tuition_master_min.toLocaleString()} - $${university.tuition_master_max.toLocaleString()} USD per year`
                        : university.tuition_master_min
                          ? `From $${university.tuition_master_min.toLocaleString()} USD per year`
                          : `Up to $${university.tuition_master_max.toLocaleString()} USD per year`
                      }
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Dorms Information */}
          <div className="university-section">
            <h2 className="university-section-title">Campus Life</h2>
            <div className="campus-info">
              <div className="info-item">
                <h3>Dorms Available</h3>
                <p>{university.dorms_available ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Degree Search Section */}
        <div className="university-programs-section">
          <h2 className="university-section-title">Available Programs</h2>

          {programsLoading ? (
            <div className="programs-loading">Loading programs...</div>
          ) : programs.length === 0 ? (
            <div className="no-programs">
              <p>No programs currently available at this university.</p>
            </div>
          ) : (
            <div className="programs-search">
              <div className="program-selector">
                <div className="dropdown-container">
                  <button
                    className="dropdown-trigger"
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    {selectedProgram ? selectedProgram.name : 'Select a program...'}
                    <span className="dropdown-arrow">▼</span>
                  </button>

                  {showDropdown && (
                    <div className="dropdown-menu">
                      {programs.map((program) => (
                        <div
                          key={program.id}
                          className="dropdown-item"
                          onClick={() => handleProgramSelect(program)}
                        >
                          <div className="program-info">
                            <h4>{program.name}</h4>
                            <p>{program.degree_level} • {program.field}</p>
                            {program.short_description && (
                              <p className="program-description">{program.short_description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="program-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={!selectedProgram || showAddedForSelection}
                  onClick={handleAddToMyApplications}
                >
                  {showAddedForSelection ? 'Added ✓' : 'Add to My Applications'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleMoreInfo}
                  disabled={!selectedProgram}
                >
                  More Information
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Back Button */}
        {/* <div className="university-navigation">
          <button
            className="btn btn-outline"
            onClick={() => navigate('/')}
          >
            ← Back to Universities
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default UniversityDetailsPage;
