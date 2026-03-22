import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight, FaMapMarkerAlt, FaClock, FaDollarSign, FaGraduationCap, FaBuilding } from 'react-icons/fa';
import searchApi from '../services/searchApi';

const ProgramDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [program, setProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProgramDetails = async () => {
      if (!id) {
        setError('Program ID not provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await searchApi.getProgramDetails(id);
        setProgram(response.data);
      } catch (err) {
        console.error('Error fetching program details:', err);
        setError('Failed to load program details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProgramDetails();
  }, [id]);

  const handleApplyNow = () => {
    if (!program) return;
    // Open apply page in same tab (user initiated action)
    navigate(`/apply?program=${program.id}&source=details`);
  };

  const handleGoBack = () => {
    window.close(); // Close the tab since this page opens in new tab
  };

  if (loading) {
    return (
      <div className="program-details-page">
        <div className="program-details-loading">
          <div className="loading-spinner"></div>
          <p>Loading program details...</p>
        </div>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="program-details-page">
        <div className="program-details-error">
          <h2>Unable to Load Program</h2>
          <p>{error || 'Program not found'}</p>
          <button onClick={handleGoBack} className="back-btn">
            <FaArrowLeft /> Close
          </button>
        </div>
      </div>
    );
  }
  

  return (
    <div className="program-details-page">
      <button onClick={handleGoBack} className="program-details-page__back-btn">
        Close
      </button>
      
      {/* Hero Section */}
      <div className="program-details-page__hero">
        <h1 className="program-details-page__hero-title">{program.name}</h1>
        <div className="program-details-page__hero-image">
          <img
            src={program.image_url || 'https://res.cloudinary.com/dollaguij/image/upload/v1771198953/32b1163d1e1ac64e4e085969c5d5b530ad530192_mnj9oa.png'}
            alt={program.image_url ? `${program.name} program` : `${program.university?.name} logo`}
          />
        </div>
        <h2 className="program-details-page__hero-subtitle">{program.university?.name}</h2>
        <p className="program-details-page__hero-location">
          {program.university?.city} 
        </p>
      </div>

      <div className="program-details-page__container">
        {/* Program Overview */}
        <div className="program-details-page__description">
          <div className="program-details-page__main-text">
            {program.description ? (
              <p><strong>{program.description}</strong></p>
            ) : program.short_description ? (
              <p><strong>{program.short_description}</strong></p>
            ) : (
              <p><strong>Detailed program information is being updated. Please contact the university directly for more information.</strong></p>
            )}
          </div>
        </div>

        {/* Program Information */}
        <div className="program-details-page__info">
          <div className="program-details-page__info-grid">
            <div className="program-details-page__info-item">
              <strong>Degree Type:</strong> {program.degree_level}
            </div>
            {program.degree_qualification && (
              <div className="program-details-page__info-item">
                <strong>Qualification:</strong> {program.degree_qualification}
              </div>
            )}
            {program.degree_title && (
              <div className="program-details-page__info-item">
                <strong>Degree Title:</strong> {program.degree_title}
              </div>
            )}
            <div className="program-details-page__info-item">
              <strong>Discipline:</strong> {program.discipline}
            </div>
            {program.domain && (
              <div className="program-details-page__info-item">
                <strong>Domain:</strong> {program.domain}
              </div>
            )}
            {program.career_horizon && (
              <div className="program-details-page__info-item">
                <strong>Career Path:</strong> {program.career_horizon}
              </div>
            )}
            {program.duration_text && (
              <div className="program-details-page__info-item">
                <strong>Duration:</strong> {program.duration_text}
              </div>
            )}
            {program.tuition_usd && (
              <div className="program-details-page__info-item">
                <strong>Tuition:</strong> ${program.tuition_usd.toLocaleString()} USD/year
              </div>
            )}
            {program.university?.region && (
              <div className="program-details-page__info-item">
                <strong>Region:</strong> {program.university?.region}
              </div>
            )}
            {program.living_cost_override_usd && (
              <div className="program-details-page__info-item">
                <strong>Living Cost:</strong> ${program.living_cost_override_usd.toLocaleString()} USD/year
              </div>
            )}
          </div>
        </div>

        {/* Requirements */}
        {program.doc_requirements && program.doc_requirements.length > 0 && (
          <div className="program-details-page__requirements">
            <h2>Required Documents</h2>
            <div className="program-details-page__requirements-list">
              {program.doc_requirements.map((requirement, index) => (
                <span key={index} className="program-details-page__requirement-item">
                  {requirement}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Application Information */}
        <div className="program-details-page__application">
          <h2>Application Information</h2>
          <div className="program-details-page__application-info">
            {program.application_url && (
              <p>
                <strong>Application Portal:</strong>{' '}
                <a href={program.application_url} target="_blank" rel="noopener noreferrer">
                  Visit University Application Portal
                </a>
              </p>
            )}
            {program.requirements?.application_deadline && (
              <p>
                <strong>Application Deadline:</strong>{' '}
                {new Date(program.requirements.application_deadline).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="program-details-page__actions">
          <button
            className="program-details-page__apply-btn"
            onClick={handleApplyNow}
          >
            Apply Now
            <FaArrowRight className="program-details-page__apply-icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProgramDetailsPage;
