import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import applicationApiService, { clearApplicationCache } from '../../services/applicationApi';
import { documentApiService } from '../../services/documentApi';
import { FaChevronLeft, FaFile, FaFileExport, FaFileUpload, FaRecycle, FaSync, FaTrash } from 'react-icons/fa';

const DocumentUploadForm = ({ applicationData, onComplete, onBack }) => {
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();

  const [requiredDocuments, setRequiredDocuments] = useState([]);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadRequiredDocuments();
    loadUploadedDocuments();
  }, [applicationData]);

  const loadRequiredDocuments = async () => {
    try {
      setLoading(true);

      // Check if we have valid application data with program ID
      if (!applicationData?.primary_major) {
        console.error('No primary_major found in applicationData:', applicationData);
        setErrors({ submit: 'Application data is incomplete. Please go back and fill in the basic information.' });
        return;
      }

      // Get required documents for primary program
      const primaryDocs = await applicationApiService.getProgramRequiredDocuments(
        applicationData.primary_major
      );

      let allRequiredDocs = primaryDocs.data || [];

      // If there's a secondary program, get its requirements too
      if (applicationData.secondary_major) {
        const secondaryDocs = await applicationApiService.getProgramRequiredDocuments(
          applicationData.secondary_major
        );

        // Merge documents (union of requirements)
        const secondaryDocsData = secondaryDocs.data || [];
        const existingTypes = allRequiredDocs.map(doc => doc.document_type);

        secondaryDocsData.forEach(doc => {
          if (!existingTypes.includes(doc.document_type)) {
            allRequiredDocs.push(doc);
          }
        });
      }

      setRequiredDocuments(allRequiredDocs);
    } catch (error) {
      console.error('Error loading required documents:', error);
      setErrors({ submit: 'Failed to load required documents. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const loadUploadedDocuments = async () => {
    try {
      const response = await documentApiService.getUserDocuments();
      setUploadedDocuments(response.data || []);
    } catch (error) {
      console.error('Error loading uploaded documents:', error);
    }
  };

  const handleFileUpload = async (documentType, file) => {
    if (!file) return;

    // Validate file type and size
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'];

    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        [documentType]: 'Invalid file type. Please upload PDF, JPG, PNG, or DOCX files only.'
      }));
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setErrors(prev => ({
        ...prev,
        [documentType]: 'File size must be less than 10MB.'
      }));
      return;
    }

    try {
      setUploadProgress(prev => ({ ...prev, [documentType]: 0 }));
      setErrors(prev => ({ ...prev, [documentType]: null }));

      // Upload file using document service
      const response = await documentApiService.uploadDocument(file, documentType);

      if (response.success) {
        // Refresh uploaded documents
        await loadUploadedDocuments();
        setUploadProgress(prev => ({ ...prev, [documentType]: 100 }));

        // Clear application cache to ensure My Applications tab shows updated data
        clearApplicationCache();

        // Clear progress after a delay
        setTimeout(() => {
          setUploadProgress(prev => ({ ...prev, [documentType]: null }));
        }, 2000);
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      setErrors(prev => ({
        ...prev,
        [documentType]: 'Upload failed. Please try again.'
      }));
      setUploadProgress(prev => ({ ...prev, [documentType]: null }));
    }
  };

  const getDocumentStatus = (documentType) => {
    const uploaded = uploadedDocuments.find(doc => doc.document_type === documentType);
    if (!uploaded) return 'missing';

    switch (uploaded.virus_scan_status) {
      case 'clean':
        return uploaded.status || 'uploaded';
      case 'pending':
        return 'processing';
      case 'suspicious':
        return 'under_review';
      default:
        return 'uploaded';
    }
  };

  const getDocName = (doc_type) => {
    switch (doc_type) {
      case 'high_school_transcript':
        return 'High School Transcript';
      case 'academic_transcript':
        return 'Academic Transcript';
      case 'diploma_certificate':
        return 'Diploma Certificate';
      case 'english_proficiency':
        return 'English Proficiency';
      case 'resume':
        return 'Resume';
      case 'cv_resume':
        return 'CV/Resume';
      case 'passport':
        return 'Passport';
      case 'financial_documents':
        return 'Financial Documents';
      case 'personal_statement':
        return 'Personal Statement';
      case 'motivation_letter':
        return 'Motivation Letter';
      case 'recommendation_letters':
        return 'Recommendation Letters';
      case 'portfolio':
        return 'Portfolio';
      case 'rejected':
        return 'Rejected';
      default:
        return doc_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  // Categorize documents into sections based on program requirements
  const categorizeDocuments = () => {
    const categories = {
      academic: {
        title: 'Academic Documents',
        types: ['academic_transcript', 'high_school_transcript', 'diploma_certificate'],
        documents: []
      },
      other: {
        title: 'Other Required Docs',
        types: ['passport', 'cv_resume', 'resume', 'financial_documents'],
        documents: []
      },
      language: {
        title: 'Language Proficiency',
        types: ['english_proficiency'],
        documents: []
      },
      essays: {
        title: 'Essays & Recommendations',
        types: ['personal_statement', 'motivation_letter', 'recommendation_letters', 'portfolio'],
        documents: []
      }
    };

    // Group required documents by category
    requiredDocuments.forEach(docReq => {
      for (const [categoryKey, category] of Object.entries(categories)) {
        if (category.types.includes(docReq.document_type)) {
          category.documents.push(docReq);
          break;
        }
      }
    });

    // Filter out empty categories
    return Object.entries(categories)
      .filter(([key, category]) => category.documents.length > 0)
      .map(([key, category]) => ({ key, ...category }));
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'missing':
        return 'Not uploaded';
      case 'uploaded':
        return 'Uploaded';
      case 'processing':
        return 'Processing...';
      case 'under_review':
        return 'Under review';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

  const isFormComplete = () => {
    const requiredDocs = requiredDocuments.filter(doc => doc.is_required);
    return requiredDocs.every(doc => {
      const status = getDocumentStatus(doc.document_type);
      return status !== 'missing';
    });
  };

  const handleComplete = async () => {
    if (isFormComplete()) {
      try {
        // Check if we have a valid application ID
        if (!applicationData?.id) {
          setErrors({ submit: 'Application data is incomplete. Please go back and save your basic information first.' });
          return;
        }

        // Update application status to 'docs_uploaded'
        await applicationApiService.updateApplication(applicationData.id, {
          status: 'docs_uploaded'
        });

        onComplete(applicationData);
      } catch (error) {
        console.error('Error updating application status:', error);
        setErrors({ submit: 'Failed to complete application. Please try again.' });
      }
    }
  };

  const handleSaveAndContinueLater = async () => {
    try {
      // Check if we have a valid application ID
      if (!applicationData?.id) {
        setErrors({ submit: 'Application data is incomplete. Please go back and save your basic information first.' });
        return;
      }

      // Determine status based on document completion
      // Only set 'docs_uploaded' if all required documents are actually uploaded
      const status = isFormComplete() ? 'docs_uploaded' : 'draft';

      await applicationApiService.updateApplication(applicationData.id, {
        status: status
      });

      // Clear application cache to refresh data
      clearApplicationCache();

      // Navigate to applications tab in profile
      navigate('/profile?tab=my-applications');
    } catch (error) {
      console.error('Error saving application:', error);
      setErrors({ submit: 'Failed to save application. Please try again.' });
    }
  };

  if (loading) {
    return (
      <div className="document-upload-form loading">
        <div className="loading-spinner">Loading document requirements...</div>
      </div>
    );
  }


  return (
    <div className="document-upload-form">
      <div className="form-header">
        <h2>Documentation</h2>
        <p>Here's what most Israeli universities need to see.</p>
        <p>Don't worry - you can save and finish later if you don't have it all at.</p>
        <div className="upload-info">
          <p><strong>Important:</strong> You'll upload your documents here so we can support and guide you.
            But you'll still need to submit them again directly to your chosen university.</p>
        </div>
      </div>

      {errors.load && (
        <div className="error-message">{errors.load}</div>
      )}

      <div className="documents-list">
        <button
          type="button"
          className="btn btn-secondary btn-back"
          onClick={onBack}
        >
          <FaChevronLeft />
        </button>

        {categorizeDocuments().map(category => (
          <div key={category.key} className="document-section">
            <h4>{category.title}</h4>
            <div className='files-list'>
              {category.documents.map(docReq => {
                const status = getDocumentStatus(docReq.document_type);
                const progress = uploadProgress[docReq.document_type];
                const error = errors[docReq.document_type];

                return (
                  <div key={docReq.document_type} className={`documents-item ${status}`}>
                    <div className="documents-header">
                      <p><strong>{getDocName(docReq.document_type)}</strong></p>
                      {status !== 'missing' && (
                        <div className="document-details">
                          {uploadedDocuments
                            .filter(doc => doc.document_type === docReq.document_type)
                            .map(doc => (
                              <div key={doc.id} className="uploaded-file">
                                <span className="file-name">{doc.original_filename}</span>
                                <span className="file-size">
                                  {(doc.file_size / 1024).toFixed(1)} KB
                                </span>
                              </div>
                            ))
                          }
                        </div>
                      )}
                    </div>

                    <div className="documents-actions">
                      {progress !== null && progress < 100 ? (
                        <div className="upload-progress">
                          <div className="progress-bar">
                            <div
                              className="progress-fill"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>
                      ) : status === 'missing' ? (
                        <div className="file-upload">
                          <input
                            type="file"
                            id={`file-${docReq.document_type}`}
                            accept=".pdf,.jpg,.jpeg,.png,.docx,.doc"
                            onChange={(e) => handleFileUpload(docReq.document_type, e.target.files[0])}
                            style={{ display: 'none' }}
                          />
                          <label
                            htmlFor={`file-${docReq.document_type}`}
                            className="btn upload-btn"
                          >
                            <FaFileUpload /> Upload
                          </label>
                        </div>
                      ) : (
                        <div className="file-upload">
                          <input
                            type="file"
                            id={`file-${docReq.document_type}`}
                            accept=".pdf,.jpg,.jpeg,.png,.docx,.doc"
                            onChange={(e) => handleFileUpload(docReq.document_type, e.target.files[0])}
                            style={{ display: 'none' }}
                          />
                          <label
                            htmlFor={`file-${docReq.document_type}`}
                            // className="btn upload-btn"
                          >
                            <FaTrash className='trash-icon' />
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* <div className="completion-status">
        <div className="progress-summary">
          <h3>Upload Progress</h3>
          <p>
            {requiredDocuments.filter(doc =>
              doc.is_required && getDocumentStatus(doc.document_type) !== 'missing'
            ).length} of {requiredDocuments.filter(doc => doc.is_required).length} required documents uploaded
          </p>
        </div>

        {!isFormComplete() && (
          <div className="missing-documents">
            <h4>Still needed:</h4>
            <ul>
              {requiredDocuments
                .filter(doc => doc.is_required && getDocumentStatus(doc.document_type) === 'missing')
                .map(doc => (
                  <li key={doc.document_type}>{doc.description}</li>
                ))
              }
            </ul>
          </div>
        )}
      </div> */}

      <div className="form-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleSaveAndContinueLater}
        >
          Save & Finish Later
        </button>
        {isFormComplete() && (
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleComplete}
          >
            Complete Application
          </button>
        )}
      </div>
    </div>
  );
};

export default DocumentUploadForm;
