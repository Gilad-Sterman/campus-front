import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiFileText, FiUpload, FiDownload, FiEye, FiEdit, FiTrash2, FiPlus, FiCalendar, FiMapPin, FiBook, FiCheck, FiClock, FiAlertCircle, FiExternalLink, FiCheckCircle } from 'react-icons/fi';
import { applicationApiService, clearApplicationCache } from '../../services/applicationApi';
import { documentApiService } from '../../services/documentApi';

const MyApplications = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('applications');
  const [applications, setApplications] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useSelector(state => state.auth);

  // Standard document types that all applications may require
  const standardDocuments = [
    {
      id: 'passport',
      name: 'Passport Scan',
      type: 'Identity Document',
      description: 'Clear scan of your passport photo page',
      required: true,
      uploaded: false // Will be updated based on user's actual uploads
    },
    {
      id: 'high_school_transcript',
      name: 'High School Transcript',
      type: 'Academic Record',
      description: 'Official high school transcript with grades',
      required: true,
      uploaded: true // Example: already uploaded
    },
    {
      id: 'high_school_diploma',
      name: 'High School Diploma',
      type: 'Academic Record',
      description: 'High school graduation certificate',
      required: true,
      uploaded: false
    },
    {
      id: 'sat_scores',
      name: 'SAT/ACT Scores',
      type: 'Standardized Test',
      description: 'Official SAT or ACT test scores',
      required: false,
      uploaded: false
    },
    {
      id: 'ap_scores',
      name: 'AP Scores',
      type: 'Standardized Test',
      description: 'Advanced Placement test scores (if applicable)',
      required: false,
      uploaded: false
    },
    {
      id: 'language_proficiency',
      name: 'Language Proficiency Test',
      type: 'Language Certificate',
      description: 'TOEFL, IELTS, or other English proficiency test',
      required: false,
      uploaded: true // Example: already uploaded
    },
    {
      id: 'resume',
      name: 'Resume/CV',
      type: 'Personal Document',
      description: 'Current resume or curriculum vitae',
      required: true,
      uploaded: false
    },
    {
      id: 'personal_statement',
      name: 'Personal Statement',
      type: 'Essay',
      description: 'Personal statement or essay',
      required: true,
      uploaded: false
    },
    {
      id: 'recommendation_letter_1',
      name: 'Recommendation Letter #1',
      type: 'Reference',
      description: 'Letter of recommendation from teacher or counselor',
      required: true,
      uploaded: false
    },
    {
      id: 'recommendation_letter_2',
      name: 'Recommendation Letter #2',
      type: 'Reference',
      description: 'Second letter of recommendation (optional)',
      required: false,
      uploaded: false
    },
    {
      id: 'recommendation_letter_3',
      name: 'Recommendation Letter #3',
      type: 'Reference',
      description: 'Third letter of recommendation (optional)',
      required: false,
      uploaded: false
    }
  ];

  const normalizeDocumentType = (documentType = '') => {
    const normalized = String(documentType).toLowerCase().trim();
    const aliases = {
      academic_transcript: 'high_school_transcript',
      diploma_certificate: 'high_school_diploma',
      english_proficiency: 'language_proficiency',
      cv_resume: 'resume'
    };

    return aliases[normalized] || normalized;
  };

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

  // Load user documents and merge with standard list
  useEffect(() => {
    const loadDocumentsData = async () => {
      try {
        const documentsResponse = await documentApiService.getUserDocuments();
        const userDocuments = documentsResponse.data || [];

        // Create a map of user documents by type
        const userDocsMap = {};
        userDocuments.forEach(doc => {
          userDocsMap[doc.document_type] = doc;
          const normalizedType = normalizeDocumentType(doc.document_type);
          if (!userDocsMap[normalizedType]) {
            userDocsMap[normalizedType] = doc;
          }
        });

        // Merge standard documents with user uploaded documents
        const mergedDocuments = standardDocuments.map(standardDoc => {
          const userDoc = userDocsMap[standardDoc.id];
          return {
            ...standardDoc,
            uploaded: !!userDoc,
            uploadedData: userDoc || null,
            uploadedAt: userDoc?.uploaded_at || null,
            status: userDoc?.status || 'missing',
            virusScanStatus: userDoc?.virus_scan_status || null
          };
        });
        setDocuments(mergedDocuments);
      } catch (err) {
        console.error('Error loading documents:', err);
        // Fallback to standard documents if API fails
        setDocuments(standardDocuments);
      }
    };

    if (user) {
      loadDocumentsData();
    }
  }, [user]);

  const handleMarkApplied = async (applicationId) => {
    try {
      setError(null);
      await applicationApiService.patchUserApplication(applicationId, { status: 'applied' });
      const applicationsResponse = await applicationApiService.getSavedUserApplications();
      setApplications(applicationsResponse.data || []);
    } catch (err) {
      console.error('Error updating application status:', err);
      setError('Failed to update application. Please try again.');
    }
  };

  const openExternalApplicationUrl = (app) => {
    const url = app.external_link || app.program?.application_url || app.university?.application_url;
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };


  const handleApplyToMore = () => {
    // Navigate to apply page to start new application
    navigate('/profile?tab=applications');
  };

  const handleDocumentUpload = async (documentId) => {
    // Create file input
    const fileInput = window.document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.jpg,.jpeg,.png,.docx,.doc';
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        await uploadDocumentFile(documentId, file);
      }
    };
    fileInput.click();
  };

  const uploadDocumentFile = async (documentId, file) => {
    try {
      setLoading(true);

      // Upload file using new API
      const response = await documentApiService.uploadDocument(file, documentId);

      // Refresh documents list to show new upload
      const documentsResponse = await documentApiService.getUserDocuments();
      const userDocuments = documentsResponse.data || [];

      // Create a map of user documents by type
      const userDocsMap = {};
      userDocuments.forEach(doc => {
        userDocsMap[doc.document_type] = doc;
        const normalizedType = normalizeDocumentType(doc.document_type);
        if (!userDocsMap[normalizedType]) {
          userDocsMap[normalizedType] = doc;
        }
      });

      // Merge standard documents with user uploaded documents
      const mergedDocuments = standardDocuments.map(standardDoc => {
        const userDoc = userDocsMap[standardDoc.id];
        return {
          ...standardDoc,
          uploaded: !!userDoc,
          uploadedData: userDoc || null,
          uploadedAt: userDoc?.uploaded_at || null,
          status: userDoc?.status || 'missing',
          virusScanStatus: userDoc?.virus_scan_status || null
        };
      });

      setDocuments(mergedDocuments);

      // Clear application cache to ensure updated document status is reflected
      clearApplicationCache();

      // Show success message based on scan result
      const scanStatus = response.data?.scan_result?.status;
      if (scanStatus === 'clean') {
        alert(`✅ ${file.name} uploaded successfully and passed security scan!`);
      } else if (scanStatus === 'suspicious') {
        alert(`⚠️ ${file.name} uploaded but flagged for manual review.`);
      } else {
        alert(`✅ ${file.name} uploaded successfully!`);
      }

    } catch (error) {
      console.error('Upload error:', error);

      let errorMessage = 'Upload failed. Please try again.';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }

      alert(`❌ Upload Error\n\n${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentView = async (documentId) => {
    const document = documents.find(doc => doc.id === documentId);
    if (document?.uploadedData?.s3_key) {
      try {
        // Generate signed URL for viewing
        const response = await documentApiService.getDocumentViewUrl(document.uploadedData.id);

        // Open document in new tab
        window.open(response.data.signedUrl, '_blank');
      } catch (error) {
        console.error('Error getting document view URL:', error);
        alert(`Failed to open document: ${document.name}`);
      }
    } else {
      alert('Document not found or not uploaded yet.');
    }
  };

  const handleDocumentReplace = async (documentId) => {
    const document = documents.find(doc => doc.id === documentId);

    // Create file input for replacement
    const fileInput = window.document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.jpg,.jpeg,.png,.docx,.doc';
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          setLoading(true);

          // Upload the replacement file
          await documentApiService.uploadDocument(file, document.uploadedData.document_type);

          // Refresh documents list to show the replacement
          const documentsResponse = await documentApiService.getUserDocuments();
          const userDocuments = documentsResponse.data || [];

          // Update documents state
          const userDocsMap = {};
          userDocuments.forEach(doc => {
            userDocsMap[doc.document_type] = doc;
            const normalizedType = normalizeDocumentType(doc.document_type);
            if (!userDocsMap[normalizedType]) {
              userDocsMap[normalizedType] = doc;
            }
          });

          const mergedDocuments = standardDocuments.map(standardDoc => {
            const userDoc = userDocsMap[standardDoc.id];
            return {
              ...standardDoc,
              uploaded: !!userDoc,
              uploadedData: userDoc || null,
              uploadedAt: userDoc?.uploaded_at || null,
              status: userDoc?.status || 'missing',
              virusScanStatus: userDoc?.virus_scan_status || null
            };
          });

          setDocuments(mergedDocuments);

          // Clear application cache to ensure updated document status is reflected
          clearApplicationCache();

        } catch (error) {
          console.error('Error replacing document:', error);
          alert(`Failed to replace ${document.name}. Please try again.`);
        } finally {
          setLoading(false);
        }
      }
    };

    // Trigger file picker
    fileInput.click();
  };


  const renderDocumentsTab = () => (
    <div className="documents-tab">
      <div className="documents-header">
        <h3>Required Documents Checklist</h3>
        <p>Upload and manage all required documents for your applications</p>
      </div>

      <div className="documents-summary">
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-number">{documents.filter(doc => doc.uploaded).length}</span>
            <span className="stat-label">Uploaded</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{documents.filter(doc => doc.required && !doc.uploaded).length}</span>
            <span className="stat-label">Required Missing</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{documents.filter(doc => !doc.required && !doc.uploaded).length}</span>
            <span className="stat-label">Optional Missing</span>
          </div>
        </div>
      </div>

      <div className="documents-list">
        {documents.map(doc => (
          <div key={doc.id} className={`document-item ${doc.uploaded ? 'uploaded' : 'missing'}`}>
            <div className="document-info">
              <div className="document-header">
                <h4 className="document-name">
                  <div className="document-icon">
                    {doc.uploaded ? (
                      <FiCheckCircle size={20} className="uploaded-icon" />
                    ) : (
                      <FiFileText size={20} className="missing-icon" />
                    )}
                  </div>
                  {doc.name}
                </h4>
                {doc.required ? (
                  <span className="required-badge">Required</span>
                ) : (
                  <span className="optional-badge">Optional</span>
                )}
              </div>
              <div className="document-details">
                <p className="document-type">{doc.type}</p>
                <p className="document-description">{doc.description}</p>
                {/* {doc.uploaded ? (
                  doc.virusScanStatus === 'pending' ? (
                    <span className="status-badge scanning">
                      <FiClock size={14} /> Scanning...
                    </span>
                  ) : doc.virusScanStatus === 'clean' ? (
                    <span className="status-badge uploaded">
                      <FiCheckCircle size={14} /> Uploaded
                    </span>
                  ) : doc.virusScanStatus === 'suspicious' ? (
                    <span className="status-badge suspicious">
                      <FiAlertCircle size={14} /> Under Review
                    </span>
                  ) : (
                    <span className="status-badge uploaded">
                      <FiCheckCircle size={14} /> Uploaded
                    </span>
                  )
                ) : (
                  <span className="status-badge missing">
                    <FiAlertCircle size={14} /> Missing
                  </span>
                )} */}
              </div>
            </div>

            <div className="document-actions">
              {doc.uploaded ? (
                <div className="uploaded-actions">
                  <button
                    className="btn-secondary"
                    onClick={() => handleDocumentView(doc.id)}
                  >
                    <FiEye size={14} /> View
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => handleDocumentReplace(doc.id)}
                  >
                    <FiUpload size={14} /> Replace
                  </button>
                </div>
              ) : (
                <button
                  className="btn-primary"
                  onClick={() => handleDocumentUpload(doc.id)}
                >
                  <FiUpload size={14} /> Upload
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="documents-help">
        <h4>Upload Guidelines</h4>
        <ul>
          <li>Accepted formats: PDF, JPG, PNG, DOCX</li>
          <li>Maximum file size: 10MB per document</li>
          <li>Ensure documents are clear and legible</li>
          <li>Official documents should be in original language with certified translations if needed</li>
        </ul>
      </div>
    </div>
  );

  const renderApplicationsTab = () => {
    if (loading) {
      return (
        <div className="applications-tab">
          <div className="applications-header">
            <h3>Program Applications</h3>
            <p>Track your university application progress</p>
          </div>
          <div className="loading-state">Loading applications...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="applications-tab">
          <div className="applications-header">
            <h3>Program Applications</h3>
            <p>Track your university application progress</p>
          </div>
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
      );
    }

    return (
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
                                onClick={() => handleMarkApplied(app.id)}
                              >
                                Mark as Applied
                              </button>
                              <button
                                type="button"
                                className="btn-outline"
                                onClick={() => openExternalApplicationUrl(app)}
                              >
                                Go to University Site
                              </button>
                            </>
                          )}

                          {app.status === 'applied' && (
                            <div className="applied-status">
                              <FiCheckCircle className="applied-icon" size={40} aria-hidden />
                              <h4>Applied</h4>
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
              <p>You haven't started any applications yet. Begin your journey to studying in Israel!</p>
              <button
                className="btn-primary"
                onClick={handleApplyToMore}
              >
                Apply Now
              </button>
            </div>
          </div>
        ) : (
          <div className="add-application">
            <button
              className="btn-primary btn-lg"
              onClick={handleApplyToMore}
            >
              Apply to More
            </button>
          </div>
        )}
      </div>
    );
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
      {/* <div className="profile-section-header">
        <h1 className="profile-section-title">My Applications</h1>
        <p className="profile-section-subtitle">
          Manage your university applications and documents
        </p>
      </div> */}

      <div className="profile-section-content">
        <div className="profile-tabs">
          <button
            className={`tab-button ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            Applications
          </button>
          <button
            className={`tab-button ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            Required Documents
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'applications' && renderApplicationsTab()}
          {activeTab === 'documents' && renderDocumentsTab()}
        </div>
      </div>
    </div>
  );
};

export default MyApplications;
