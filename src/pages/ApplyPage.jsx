import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BasicInfoForm from '../components/application/BasicInfoForm';
import applicationApiService, { clearApplicationCache } from '../services/applicationApi';
import { FaCheck } from 'react-icons/fa';

const buildThankYouState = (finalData) => ({
  applicationData: finalData,
  applications: finalData.secondary_major ? [
    { program: finalData.primary_major, university: finalData.primary_university },
    { program: finalData.secondary_major, university: finalData.secondary_university }
  ] : [
    { program: finalData.primary_major, university: finalData.primary_university }
  ]
});

const ApplyPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { isAuthenticated } = useSelector(state => state.auth);

  const [applicationData, setApplicationData] = useState(null);
  const [existingApplication, setExistingApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      const programId = searchParams.get('program');
      const universityId = searchParams.get('university');
      const source = searchParams.get('source');

      if (programId || universityId || source) {
        sessionStorage.setItem('pendingApplicationData', JSON.stringify({
          programId,
          universityId,
          source,
          timestamp: Date.now()
        }));
      }
    }

    checkExistingApplication();
  }, [isAuthenticated, navigate]);

  const checkExistingApplication = async () => {
    try {
      setLoading(true);

      const continueApplicationId = searchParams.get('continue');

      if (continueApplicationId) {
        try {
          const applicationResponse = await applicationApiService.getApplicationById(continueApplicationId);
          const application = applicationResponse.data;

          if (application) {
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

            if (!formData.primary_major && application.program_id) {
              formData.primary_major = application.program_id;
            }

            const merged = { ...application, ...formData };

            const hasBasicInfo = application.program_id &&
              formData.primary_university &&
              formData.current_education_level &&
              formData.hebrew_proficiency;

            const shouldSkipToThankYou =
              application.status === 'docs_uploaded' ||
              hasBasicInfo;

            if (shouldSkipToThankYou) {
              const finalData = {
                ...formData,
                id: application.id,
                primary_major: formData.primary_major || application.program_id,
                primary_university: formData.primary_university,
                current_education_level: formData.current_education_level,
                gpa: formData.gpa,
                hebrew_proficiency: formData.hebrew_proficiency,
                been_to_israel: formData.been_to_israel
              };
              navigate('/apply/thank-you', { state: buildThankYouState(finalData) });
              return;
            }

            setApplicationData(merged);
            return;
          }
        } catch (err) {
          console.error('Error loading specific application:', err);
          setError('Failed to load application. Please try again.');
          return;
        }
      }

      let programId = searchParams.get('program');
      let universityId = searchParams.get('university');
      let source = searchParams.get('source');

      if (!programId) {
        const storedData = sessionStorage.getItem('pendingApplicationData');
        if (storedData) {
          try {
            const parsed = JSON.parse(storedData);
            if (Date.now() - parsed.timestamp < 10 * 60 * 1000) {
              programId = parsed.programId;
              universityId = parsed.universityId;
              source = parsed.source;
            }
            sessionStorage.removeItem('pendingApplicationData');
          } catch (e) {
            console.error('Error parsing stored application data:', e);
            sessionStorage.removeItem('pendingApplicationData');
          }
        }
      }

      if (programId) {
        const statusResponse = await applicationApiService.getApplicationStatus(programId);

        if (statusResponse.data) {
          setExistingApplication(statusResponse.data);
          setError({
            type: 'existing_application',
            program: statusResponse.data.program?.name,
            university: statusResponse.data.program?.university?.name,
            applicationId: statusResponse.data.id
          });
          return;
        }

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
            setApplicationData({
              primary_major: programId,
              primary_university: universityId,
              source: source || 'apply'
            });
          }
        } catch (err) {
          console.error('Error loading program details:', err);
          setApplicationData({
            primary_major: programId,
            source: 'intro'
          });
        }
      }

      await applicationApiService.getUserApplications();
    } catch (err) {
      console.error('Error checking existing application:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBasicInfoNext = (formData) => {
    setApplicationData(formData);
    clearApplicationCache();
    navigate('/apply/thank-you', { state: buildThankYouState(formData) });
  };

  const handleBasicInfoSave = (formData) => {
    setApplicationData(formData);
  };

  const handleContinueApplication = () => {
    if (existingApplication) {
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
        formData = {
          primary_major: existingApplication.program?.id || existingApplication.program_id
        };
      }

      const applicationDataForContinue = {
        ...existingApplication,
        ...formData,
        primary_major: existingApplication.program?.id || existingApplication.program_id,
        id: existingApplication.id
      };

      const hasBasicInfo = (existingApplication.program?.id || existingApplication.program_id) &&
        formData.primary_university &&
        formData.current_education_level &&
        formData.hebrew_proficiency;

      setError(null);
      setExistingApplication(null);

      if (existingApplication.status === 'docs_uploaded' || hasBasicInfo) {
        navigate('/apply/thank-you', { state: buildThankYouState(applicationDataForContinue) });
      } else {
        setApplicationData(applicationDataForContinue);
      }
    }
  };

  const handleViewApplication = () => {
    if (existingApplication) {
      navigate(`/profile?tab=my-applications&highlight=${existingApplication.applicationId}`);
    }
  };

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
                Looks like you&apos;ve already started an application to <strong>{error.program}</strong> at <strong>{error.university}</strong>.
              </p>
              <div className="notice-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleViewApplication}
                >
                  View Application
                </button>
                {canContinue && (
                  <button
                    type="button"
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

  if (error && typeof error === 'string') {
    return (
      <div className="apply-page">
        <div className="container">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="apply-page">
      <div className="apply-page_hero">
        <h2 className="apply-page_hero-title">APPLICATION</h2>
        <div className="apply-page__hero-image">
          <img src="https://mzyjtmyoxpsnnxsvucup.supabase.co/storage/v1/object/public/university-logos/GettyImages-2248592663.jpg" alt="Application" />
        </div>
      </div>
      <div className="container">
        <div className="progress-tracker">
          <div className="progress-steps">
            <div className="step completed">
              <div className="step-number">
                <FaCheck />
              </div>
              <div className="step-label">Register/Login</div>
            </div>
            <div className="step-connector"></div>
            <div className="step active">
              <div className="step-number">2</div>
              <div className="step-label">Basic Information</div>
            </div>
          </div>
        </div>

        <div className="application-content">
          <BasicInfoForm
            onNext={handleBasicInfoNext}
            onSave={handleBasicInfoSave}
            initialData={applicationData}
          />
        </div>
      </div>
    </div>
  );
};

export default ApplyPage;
