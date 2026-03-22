import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiFileText, FiUpload, FiDownload, FiEye, FiEdit, FiTrash2, FiPlus, FiCalendar, FiMapPin, FiBook, FiCheck, FiClock, FiAlertCircle, FiExternalLink, FiCheckCircle } from 'react-icons/fi';
import { applicationApiService, clearApplicationCache } from '../../services/applicationApi';
import { universityApiService } from '../../services/universityApi';
import { documentApiService } from '../../services/documentApi';

const MyApplications = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('applications');
  const [applications, setApplications] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [uploadedDocumentTypes, setUploadedDocumentTypes] = useState([]);
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

  const getApplicationDocumentProgress = (application) => {
    const requiredDocs = Array.isArray(application?.program?.doc_requirements) && application.program.doc_requirements.length > 0
      ? application.program.doc_requirements
      : standardDocuments.filter((doc) => doc.required).map((doc) => doc.id);

    const requiredTypes = [...new Set(requiredDocs.map((docType) => normalizeDocumentType(docType)))];
    const uploadedTypesSet = new Set(uploadedDocumentTypes.map((docType) => normalizeDocumentType(docType)));
    const uploadedCount = requiredTypes.filter((docType) => uploadedTypesSet.has(docType)).length;
    const totalRequired = requiredTypes.length;
    const progressPercent = totalRequired > 0 ? Math.round((uploadedCount / totalRequired) * 100) : 0;

    return { uploadedCount, totalRequired, progressPercent };
  };

  const loadApplicationsData = async () => {
    try {
      setLoading(true);
      const applicationsResponse = await applicationApiService.getUserApplications();
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
        setUploadedDocumentTypes(userDocuments.map((doc) => doc.document_type));

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

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      const updateData = {
        status: newStatus,
        ...(newStatus === 'confirmed_applied' && { confirmed_at: new Date().toISOString() }),
        ...(newStatus === 'redirected' && { redirected_at: new Date().toISOString() })
      };

      await applicationApiService.updateApplication(applicationId, updateData);

      // Refresh applications list
      const applicationsResponse = await applicationApiService.getUserApplications();
      setApplications(applicationsResponse.data || []);
    } catch (err) {
      console.error('Error updating application status:', err);
      setError('Failed to update application. Please try again.');
    }
  };


  const handleOpenUploadInterface = (applicationId) => {
    // Navigate to apply page step 3 (documents) for this application
    navigate(`/apply?continue=${applicationId}&step=3`);
  };

  const handleApplyToMore = () => {
    // Navigate to apply page to start new application
    navigate('/profile?tab=applications');
  };

  const handleDeleteApplication = async (applicationId) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        await applicationApiService.deleteApplication(applicationId);

        // Refresh applications list to ensure it's gone
        await loadApplicationsData();
      } catch (err) {
        console.error('Error deleting application:', err);
        setError('Failed to delete application. Please try again.');
      }
    }
  };

  const handleDocumentUpload = async (documentId) => {
    const documentItem = documents.find(doc => doc.id === documentId);

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
      setUploadedDocumentTypes(userDocuments.map((doc) => doc.document_type));

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
          const response = await documentApiService.uploadDocument(file, document.uploadedData.document_type);

          // Refresh documents list to show the replacement
          const documentsResponse = await documentApiService.getUserDocuments();
          const userDocuments = documentsResponse.data || [];
          setUploadedDocumentTypes(userDocuments.map((doc) => doc.document_type));

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
                const { uploadedCount, totalRequired, progressPercent } = getApplicationDocumentProgress(app);
                const programImageUrl = app.program?.image_url || app.program?.university?.logo_url;

                return (
                  <>
                    <div className='application-header'>
                      <h3 className="application-university">{app.program?.university?.name}</h3>
                      <p className="application-title">{app.program?.name}, {formatDegreeLevel(app.program?.degree_level)}</p>
                    </div>
                    <div className='application-content'>
                      <div className='application-details'>
                        {app.status !== 'confirmed_applied' && (
                          <div className='document-progress'>
                            <p>Required documents you uploaded</p>
                            <div className='document-progress-track'>
                              <div className='document-progress-fill' style={{ width: `${progressPercent}%` }} />
                            </div>
                          </div>
                        )}
                        {/* <span className={`status-badge ${app.status}`}>
                    {app.status.replace('_', ' ')}
                  </span> */}
                        <div className="application-actions">
                          {app.status !== 'confirmed_applied' && (
                            <>
                              <button
                                className="btn-outline"
                                onClick={() => handleStatusUpdate(app.id, 'confirmed_applied')}
                              >
                                Mark as Applied
                              </button>
                              <button
                                className="btn-outline"
                                onClick={() => {
                                  if (app.status !== 'redirected') {
                                    handleStatusUpdate(app.id, 'redirected');
                                  }
                                  window.open(app.external_redirect_url || app.program?.application_url, '_blank');
                                }}
                              >
                                University Application
                              </button>
                            </>
                          )}

                          {app.status === 'confirmed_applied' && (
                            <div className="applied-status">
                              <img className="applied-icon" src="https://mzyjtmyoxpsnnxsvucup.supabase.co/storage/v1/object/public/university-logos/09651966a64b6879d4f4c2fcccbf849ac6c8d95a.png" alt="" />
                              <h4>Successfully Applied!</h4>
                              {/* {app.confirmed_at && (
                                <small>on {new Date(app.confirmed_at).toLocaleDateString()}</small>
                              )} */}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="application-image">
                        {programImageUrl ? (
                          <img src={programImageUrl} alt={`${app.program?.name || 'Program'} image`} />
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
