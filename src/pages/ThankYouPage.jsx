import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import applicationApiService from '../services/applicationApi';
import { FaCheck } from 'react-icons/fa';

const ThankYouPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector(state => state.auth);

  const [universities, setUniversities] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [universityList, setUniversityList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get application data from navigation state
  const applicationData = location.state?.applicationData;
  const applications = location.state?.applications || [];

  useEffect(() => {
    // Redirect if not authenticated or no application data
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!applicationData) {
      navigate('/apply');
      return;
    }

    loadUniversityDetails();
  }, [isAuthenticated, applicationData, navigate]);

  const loadUniversityDetails = async () => {
    try {
      setLoading(true);

      // Load programs and universities data
      const [universityResponse, programResponse] = await Promise.all([
        applicationApiService.getUniversities(),
        applicationApiService.getPrograms()
      ]);

      setUniversityList(universityResponse.data || []);
      setPrograms(programResponse.data || []);

      // Get university details for the application(s)
      const universityDetails = applications.map((app) => {
        const university = universityResponse.data?.find(u => u.id === app.university);
        const program = programResponse.data?.find(p => p.id === app.program);

        return {
          university,
          program,
          applicationUrl: program?.application_url || university?.application_url
        };
      });

      setUniversities(universityDetails.filter(u => u.university && u.program));

    } catch (error) {
      console.error('Error loading university details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUniversityRedirect = async (applicationUrl, universityName, programId) => {
    if (applicationUrl) {
      try {
        // Update application status to 'redirected'
        await applicationApiService.updateApplication(applicationData.id, {
          status: 'redirected',
          redirected_at: new Date().toISOString()
        });

        // Track the redirect event
        window.open(applicationUrl, '_blank');
      } catch (error) {
        console.error('Error updating application status:', error);
        // Still open the URL even if status update fails
        window.open(applicationUrl, '_blank');
      }
    }
  };

  // Helper functions to get names from IDs
  const getProgramName = (programId) => {
    const program = programs.find(p => p.id === programId);
    return program?.name || programId;
  };

  const getUniversityName = (universityId) => {
    const university = universityList.find(u => u.id === universityId);
    return university?.name || universityId;
  };

  if (loading) {
    return (
      <div className="thank-you-page loading">
        <div className="container">
          <div className="loading-spinner">
            <h2>Preparing your application summary...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="thank-you-page">
      {/* Hero Section */}
      <div className="apply-page_hero">
        <h2 className="apply-page_hero-title">APPLICATION</h2>
        <div className="apply-page__hero-image">
          <img src="https://mzyjtmyoxpsnnxsvucup.supabase.co/storage/v1/object/public/university-logos/GettyImages-2248592663.jpg" alt="Application" />
        </div>
      </div>
      <div className="container">
        {/* Progress Tracker - All Complete */}
        <div className="progress-tracker completed">
          <div className="progress-steps">
            <div className="step completed">
              <div className="step-number"><FaCheck /></div>
              <div className="step-label">Register</div>
            </div>
            <div className="step-connector"></div>
            <div className="step completed">
              <div className="step-number"><FaCheck /></div>
              <div className="step-label">Basic Information</div>
            </div>
            <div className="step-connector"></div>
            <div className="step completed">
              <div className="step-number"><FaCheck /></div>
              <div className="step-label">Documentation</div>
            </div>
          </div>
        </div>

        {/* Thank You Section */}
        <div className="thank-you-content">
          <div className="thank-you-header">
            <h1>THANK YOU</h1>
          </div>

          <div className="confirmation-message">
            <h3>We have almost everything we need to begin your enrolment.</h3>
            <p>
              If anything is missing or if additional documents are required for your intended major(s), we'll reach out directly to guide you through the next steps.
            </p>
            <p>
              To continue your application with major specific requirements and documentation, continue your application in the selected university website
            </p>
          </div>

          {universities[0]?.program?.application_url &&
            <button
              className="btn btn-primary university-btn"
              onClick={() => handleUniversityRedirect(universities[0]?.program?.application_url, universities[0]?.university?.name)}
            >
              Continue in university's site
            </button>}

          {/* Application Summary */}
          {/* <div className="application-summary">
            <h2>Your Application Summary</h2>
            <div className="summary-details">
              <div className="detail-item">
                <strong>Primary Program:</strong> {getProgramName(applicationData.primary_major)}
              </div>
              <div className="detail-item">
                <strong>Primary University:</strong> {getUniversityName(applicationData.primary_university)}
              </div>
              {applicationData.secondary_major && (
                <>
                  <div className="detail-item">
                    <strong>Secondary Program:</strong> {getProgramName(applicationData.secondary_major)}
                  </div>
                  <div className="detail-item">
                    <strong>Secondary University:</strong> {getUniversityName(applicationData.secondary_university)}
                  </div>
                </>
              )}
              <div className="detail-item">
                <strong>Education Level:</strong> {applicationData.current_education_level}
              </div>
              <div className="detail-item">
                <strong>Hebrew Proficiency:</strong> {applicationData.hebrew_proficiency}
              </div>
            </div>
          </div> */}

          {/* University Application Links */}
          {/* <div className="university-applications">
            <h2>Next Steps: Complete University Applications</h2>
            <p className="next-steps-info">
              Campus Israel acts as a document collection platform for internal tracking, advising, and future support.
              However, real enrollment still happens via each university's website, where you must submit these documents again.
            </p>

            <div className="university-links">
              {universities.map((uni, index) => (
                <div key={index} className="university-card">
                  <div className="university-info">
                    <h3>{uni.university?.name}</h3>
                    <p>{uni.program?.name}</p>
                    <span className="degree-level">{uni.program?.degree_level}</span>
                  </div>
                  <div className="university-actions">
                    {uni.program.application_url ? (
                      <button
                        className="btn btn-primary university-btn"
                        onClick={() => handleUniversityRedirect(uni.program.application_url, uni.university?.name)}
                      >
                        GO TO UNIVERSITY SITE
                      </button>
                    ) : (
                      <div className="no-link-notice">
                        <p>Application link will be provided via email</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div> */}

          {/* What Happens Next */}
          {/* <div className="next-steps">
            <h2>What Happens Next?</h2>
            <div className="steps-grid">
              <div className="next-step">
                <div className="step-icon">📧</div>
                <h3>We'll Contact You</h3>
                <p>Our team will review your application and reach out with any questions or additional requirements.</p>
              </div>
              <div className="next-step">
                <div className="step-icon">🏫</div>
                <h3>University Application</h3>
                <p>Complete the official university application using the links above with the documents you've already prepared.</p>
              </div>
              <div className="next-step">
                <div className="step-icon">🎓</div>
                <h3>Ongoing Support</h3>
                <p>We'll continue to support you throughout the enrollment process and your studies in Israel.</p>
              </div>
            </div>
          </div> */}

          {/* Action Buttons */}
          <div className="thank-you-actions">
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/profile?tab=my-applications')}
            >
              View My Applications
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;
