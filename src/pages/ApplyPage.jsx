import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BasicInfoForm from '../components/application/BasicInfoForm';
import DocumentUploadForm from '../components/application/DocumentUploadForm';
import applicationApiService, { clearApplicationCache } from '../services/applicationApi';
import { FaCheck } from 'react-icons/fa';

const ApplyPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get auth and quiz state from Redux
  const { isAuthenticated, user, quizState } = useSelector(state => state.auth);
  const quizCompleted = quizState?.data?.status === 'completed';
  const quizResults = quizState?.data;

  const [currentStep, setCurrentStep] = useState(2); // Start at Step 2 (Basic Info) since login is handled
  const [applicationData, setApplicationData] = useState(null);
  const [existingApplication, setExistingApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Store application data in session storage for after login
  useEffect(() => {
    if (isAuthenticated) {
      const programId = searchParams.get('program');
      const universityId = searchParams.get('university');
      const source = searchParams.get('source');
      
      if (programId || universityId || source) {
        sessionStorage.setItem('pendingApplicationData', JSON.stringify({
          programId,
          universityId,
          source
        }));
      }
    }

    checkExistingApplication();
  }, [isAuthenticated, navigate]);

  // Check for existing applications and handle program/university from URL params
  const checkExistingApplication = async () => {
    try {
      setLoading(true);

      const continueApplicationId = searchParams.get('continue');
      const stepParam = searchParams.get('step');

      // Handle continuing a specific application
      if (continueApplicationId) {
        try {
          const applicationResponse = await applicationApiService.getApplicationById(continueApplicationId);
          const application = applicationResponse.data;

          if (application) {
            setApplicationData(application);

            // Parse notes to get form data
            let formData = {};
            if (application.notes) {
              try {
                const notes = JSON.parse(application.notes);
                formData = {
                  primary_major: application.program_id,
                  primary_university: notes.primary_university,
                  current_education_level: notes.current_education_level,
                  gpa: notes.gpa,
                  hebrew_proficiency: notes.hebrew_proficiency,
                  been_to_israel: notes.been_to_israel
                };
              } catch (e) {
                console.error('Error parsing application notes:', e);
              }
            }

            // Ensure program_id is set even if notes are missing
            if (!formData.primary_major && application.program_id) {
              formData.primary_major = application.program_id;
            }

            setApplicationData({ ...application, ...formData });

            // Use step parameter if provided, otherwise determine step based on application completeness
            if (stepParam) {
              setCurrentStep(parseInt(stepParam));
            } else {
              const hasBasicInfo = application.program_id &&
                formData.primary_university &&
                formData.current_education_level &&
                formData.hebrew_proficiency;

              if (hasBasicInfo || application.status === 'docs_uploaded') {
                setCurrentStep(3); // Go to documents step
              } else {
                setCurrentStep(2); // Stay on basic info step
              }
            }
            return;
          }
        } catch (error) {
          console.error('Error loading specific application:', error);
          setError('Failed to load application. Please try again.');
          return;
        }
      }

      // Check for stored program data from login redirect
      let programId = searchParams.get('program');
      let universityId = searchParams.get('university');
      let source = searchParams.get('source');

      // If no URL params, check sessionStorage for data stored before login
      if (!programId) {
        const storedData = sessionStorage.getItem('pendingApplicationData');
        if (storedData) {
          try {
            const parsed = JSON.parse(storedData);
            // Only use stored data if it's recent (within 10 minutes)
            if (Date.now() - parsed.timestamp < 10 * 60 * 1000) {
              programId = parsed.programId;
              universityId = parsed.universityId;
              source = parsed.source;
            }
            // Clear the stored data after using it
            sessionStorage.removeItem('pendingApplicationData');
          } catch (e) {
            console.error('Error parsing stored application data:', e);
            sessionStorage.removeItem('pendingApplicationData');
          }
        }
      }

      // Handle program selection from intro page, domain page, or stored data
      if (programId) {
        // Check if user already has application for this program
        const statusResponse = await applicationApiService.getApplicationStatus(programId);

        if (statusResponse.data) {
          // User already applied to this program
          setExistingApplication(statusResponse.data);
          setError({
            type: 'existing_application',
            program: statusResponse.data.program?.name,
            university: statusResponse.data.program?.university?.name,
            applicationId: statusResponse.data.id
          });
          return;
        }

        // Pre-fill application data with selected program
        try {
          const programsResponse = await applicationApiService.getPrograms();
          const programs = programsResponse.data || [];
          const selectedProgram = programs.find(p => p.id === programId);

          if (selectedProgram) {
            const preFilledData = {
              primary_major: programId,
              primary_university: universityId || selectedProgram.university_id,
              source: source || 'apply'
            };
            setApplicationData(preFilledData);
          } else {
            // Fallback: just set the program ID, let the form handle university selection
            setApplicationData({
              primary_major: programId,
              primary_university: universityId,
              source: source || 'apply'
            });
          }
        } catch (err) {
          console.error('Error loading program details:', err);
          // Fallback: just set the program ID
          setApplicationData({
            primary_major: programId,
            source: 'intro'
          });
        }
      }

      // Load user's existing applications to check completion status
      const applicationsResponse = await applicationApiService.getUserApplications();
      const applications = applicationsResponse.data || [];

      // Only auto-load draft applications if continuing a specific one
      // Don't auto-load when navigating from "Browse More Programs"

    } catch (error) {
      console.error('Error checking existing application:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBasicInfoNext = (formData) => {
    setApplicationData(formData);
    setCurrentStep(3);
    // Clear application cache when moving to documents step
    clearApplicationCache();
  };

  const handleBasicInfoSave = (formData) => {
    setApplicationData(formData);
    // Auto-save handled in component
  };

  const handleDocumentBack = () => {
    setCurrentStep(2);
  };

  const handleApplicationComplete = (finalData) => {
    // Navigate to thank you page
    navigate('/apply/thank-you', {
      state: {
        applicationData: finalData,
        applications: finalData.secondary_major ? [
          { program: finalData.primary_major, university: finalData.primary_university },
          { program: finalData.secondary_major, university: finalData.secondary_university }
        ] : [
          { program: finalData.primary_major, university: finalData.primary_university }
        ]
      }
    });
  };

  const handleViewApplication = () => {
    if (existingApplication) {
      navigate(`/profile?tab=my-applications&highlight=${existingApplication.applicationId}`);
    }
  };

  const handleContinueApplication = () => {
    if (existingApplication) {
      // Parse notes to get form data if available
      let formData = {};
      if (existingApplication.notes) {
        try {
          const notes = JSON.parse(existingApplication.notes);
          formData = {
            primary_major: existingApplication.program?.id || existingApplication.program_id,
            primary_university: notes.primary_university,
            current_education_level: notes.current_education_level,
            gpa: notes.gpa,
            hebrew_proficiency: notes.hebrew_proficiency,
            been_to_israel: notes.been_to_israel
          };
        } catch (e) {
          console.error('Error parsing application notes:', e);
        }
      } else {
        // If no notes, at least set the program ID
        formData = {
          primary_major: existingApplication.program?.id || existingApplication.program_id
        };
      }

      // Ensure we have the program ID in the correct format for DocumentUploadForm
      const applicationDataForContinue = {
        ...existingApplication,
        ...formData,
        primary_major: existingApplication.program?.id || existingApplication.program_id,
        id: existingApplication.id
      };

      setApplicationData(applicationDataForContinue);

      // Determine step based on application status and completeness
      if (existingApplication.status === 'docs_uploaded') {
        setCurrentStep(3); // Go to documents step
      } else {
        // Check if basic info is complete
        const hasBasicInfo = (existingApplication.program?.id || existingApplication.program_id) &&
          formData.primary_university &&
          formData.current_education_level &&
          formData.hebrew_proficiency;

        setCurrentStep(hasBasicInfo ? 3 : 2);
      }

      setError(null);
      setExistingApplication(null);
    }
  };

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="apply-page loading">
        <div className="container">
          <div className="loading-spinner">
            <h2>Loading your application...</h2>
          </div>
        </div>
      </div>
    );
  }

  // Handle existing application error
  if (error && error.type === 'existing_application') {
    const canContinue = existingApplication &&
      (existingApplication.status === 'draft' || existingApplication.status === 'docs_uploaded');

    return (
      <div className="apply-page">
        <div className="container">
          <div className="existing-application-notice">
            <h1>Application Already Started</h1>
            <div className="notice-content">
              <p>
                Looks like you've already started an application to <strong>{error.program}</strong> at <strong>{error.university}</strong>.
              </p>
              <div className="notice-actions">
                <button
                  className="btn btn-primary"
                  onClick={handleViewApplication}
                >
                  View Application
                </button>
                {canContinue && (
                  <button
                    className="btn btn-secondary"
                    onClick={handleContinueApplication}
                  >
                    Continue Application
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="apply-page">
      {/* Hero Section */}
      <div className="apply-page_hero">
        <h2 className="apply-page_hero-title">APPLICATION</h2>
        <div className="apply-page__hero-image">
          <img src="https://mzyjtmyoxpsnnxsvucup.supabase.co/storage/v1/object/public/university-logos/GettyImages-2248592663.jpg" alt="Application" />
        </div>
      </div>
      <div className="container">
        {/* Progress Tracker */}
        <div className="progress-tracker">
          <div className="progress-steps">
            <div className="step completed">
              <div className="step-number">
                <FaCheck />
              </div>
              <div className="step-label">Register/Login</div>
            </div>
            <div className="step-connector"></div>
            <div className={`step ${currentStep > 2 ? 'completed' : ''} ${currentStep === 2 ? 'active' : ''}`}>
              {currentStep > 2 ? <div className="step-number"><FaCheck /></div> : <div className="step-number">2</div>}
              <div className="step-label">Basic Information</div>
            </div>
            <div className="step-connector"></div>
            <div className={`step ${currentStep > 3 ? 'completed' : ''} ${currentStep === 3 ? 'active' : ''}`}>
              {currentStep > 3 ? <div className="step-number"><FaCheck /></div> : <div className="step-number">3</div>}
              <div className="step-label">Documentation</div>
            </div>
          </div>
        </div>

        {/* Quiz Recommendation (Optional) */}
        {/* {currentStep === 2 && (
          <div className="quiz-recommendation">
            <div className="recommendation-card">
              <p>Get personalized recommendations with our AI-powered quiz</p>
              {quizCompleted ? (
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate('/profile?tab=quiz-results')}
                >
                  VIEW MY RESULTS
                </button>
              ) : quizResults && quizResults.status === 'in_progress' ? (
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate('/quiz')}
                >
                  CONTINUE QUIZ
                </button>
              ) : (
                <button 
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate('/quiz')}
                >
                  START FREE QUIZ
                </button>
              )}
            </div>
          </div>
        )} */}

        {/* Application Form Steps */}
        <div className="application-content">
          {currentStep === 2 && (
            <BasicInfoForm
              onNext={handleBasicInfoNext}
              onSave={handleBasicInfoSave}
              initialData={applicationData}
            />
          )}

          {currentStep === 3 && (
            <DocumentUploadForm
              applicationData={applicationData}
              onComplete={handleApplicationComplete}
              onBack={handleDocumentBack}
            />
          )}

        </div>
      </div>
    </div>
  );
};

export default ApplyPage;
