import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiBook } from 'react-icons/fi';
import { applicationApiService } from '../../services/applicationApi';

const appliedSuccessImageUrl =
  'https://mzyjtmyoxpsnnxsvucup.supabase.co/storage/v1/object/public/university-logos/09651966a64b6879d4f4c2fcccbf849ac6c8d95a.png';

const MyApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [markingAppliedId, setMarkingAppliedId] = useState(null);
  const { user } = useSelector(state => state.auth);

  const formatDegreeLevel = (degreeLevel = '') => {
    const level = String(degreeLevel).toLowerCase();
    if (level === 'bachelor') return 'BA';
    if (level === 'master') return 'MA';
    if (level === 'phd') return 'PhD';
    return degreeLevel ? degreeLevel.toUpperCase() : '';
  };

  const loadApplicationsData = async () => {
    try {
      setLoading(true);
      const applicationsResponse = await applicationApiService.getSavedUserApplications();
      const userApplications = applicationsResponse.data || [];

      setApplications(userApplications);
    } catch (err) {
      console.error('Error loading applications:', err);
      setError('Failed to load applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadApplicationsData();
    }
  }, [user]);

  const handleMarkApplied = async (applicationId) => {
    try {
      setError(null);
      setMarkingAppliedId(applicationId);
      await applicationApiService.patchUserApplication(applicationId, { status: 'applied' });
      const applicationsResponse = await applicationApiService.getSavedUserApplications();
      setApplications(applicationsResponse.data || []);
    } catch (err) {
      console.error('Error updating application status:', err);
      setError('Failed to update application. Please try again.');
    } finally {
      setMarkingAppliedId(null);
    }
  };

  const openExternalApplicationUrl = (app) => {
    const url = app.external_link || app.program?.application_url || app.university?.application_url;
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleApplyToMore = () => {
    navigate('/apply/intro');
  };

  if (loading) {
    return (
      <div className="profile-section">
        <div className="loading-state">Loading your applications...</div>
      </div>
    );
  }

  return (
    <div className="profile-section">
      <div className="profile-section-content">
        <div className="tab-content">
          {error ? (
            <div className="applications-tab">
              <div className="applications-header">
                <h3>Program Applications</h3>
                <p>Track your university application progress</p>
              </div>
              <div className="error-state">
                <p>{error}</p>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <div className="applications-tab">
              <div className="applications-list">
                {applications.map(app => (
                  <div key={app.id} className={`application-item ${app.status}`}>
                    {(() => {
                      const programImageUrl =
                        app.program?.image_url || app.university?.logo_url || app.program?.university?.logo_url;
                      const universityName = app.university?.name || app.program?.university?.name;
                      const programTitle = app.program?.name;

                      return (
                        <>
                          <div className="application-header">
                            <h3 className="application-university">{universityName || 'University'}</h3>
                            <p className="application-title">
                              {programTitle ? `${programTitle}, ${formatDegreeLevel(app.program?.degree_level)}` : 'Program'}
                            </p>
                            {app.program_unavailable && (
                              <p className="application-unavailable-notice" role="alert">
                                Program no longer available
                              </p>
                            )}
                          </div>
                          <div className="application-content">
                            <div className="application-details">
                              <div className="application-actions">
                                {app.status !== 'applied' && (
                                  <>
                                    <button
                                      type="button"
                                      className="btn-outline"
                                      disabled={markingAppliedId === app.id}
                                      aria-busy={markingAppliedId === app.id}
                                      onClick={() => handleMarkApplied(app.id)}
                                    >
                                      {markingAppliedId === app.id ? (
                                        <>
                                          <span className="mark-as-applied-spinner" aria-hidden />
                                          Saving...
                                        </>
                                      ) : (
                                        'Mark as Applied'
                                      )}
                                    </button>
                                    <button
                                      type="button"
                                      className="btn-outline"
                                      disabled={markingAppliedId === app.id}
                                      onClick={() => openExternalApplicationUrl(app)}
                                    >
                                      Go to University Site
                                    </button>
                                  </>
                                )}

                                {app.status === 'applied' && (
                                  <div className="applied-status">
                                    <img
                                      className="applied-icon"
                                      src={appliedSuccessImageUrl}
                                      alt=""
                                    />
                                    <h4>Successfully Applied!</h4>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="application-image">
                              {programImageUrl ? (
                                <img src={programImageUrl} alt={`${programTitle || 'Program'} image`} />
                              ) : (
                                <div className="application-image-placeholder">
                                  <FiBook size={28} />
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                ))}
              </div>
              {applications.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-content">
                    <h3> No Applications Yet</h3>
                    <p>You haven&apos;t started any applications yet. Begin your journey to studying in Israel!</p>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={handleApplyToMore}
                    >
                      Application Hub
                    </button>
                  </div>
                </div>
              ) : (
                <div className="add-application">
                  <button
                    type="button"
                    className="btn-primary btn-lg"
                    onClick={handleApplyToMore}
                  >
                    Add more programs
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyApplications;
