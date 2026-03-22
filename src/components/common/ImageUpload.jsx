import React, { useState, useRef } from 'react';
import api from '../../services/api';

const ImageUpload = ({ 
  currentImageUrl = null,
  onImageUpload,
  onImageRemove,
  bucketName = 'university-logos',
  maxSizeBytes = 5242880, // 5MB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
  className = '',
  disabled = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Validate file before upload
  const validateFile = (file) => {
    if (!file) return 'No file selected';
    
    if (!acceptedTypes.includes(file.type)) {
      return `Invalid file type. Accepted types: ${acceptedTypes.join(', ')}`;
    }
    
    if (file.size > maxSizeBytes) {
      const maxSizeMB = (maxSizeBytes / (1024 * 1024)).toFixed(1);
      return `File too large. Maximum size: ${maxSizeMB}MB`;
    }
    
    return null;
  };


  // Handle file upload
  const handleFileUpload = async (file) => {
    setError(null);
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setUploading(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('logo', file);
      
      // Upload file via backend API
      const response = await api.post('/upload/university-logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        const { url, fileName } = response.data.data;
        
        // Update preview and notify parent
        setPreviewUrl(url);
        onImageUpload(url, fileName);
      } else {
        throw new Error(response.data.error || 'Upload failed');
      }

    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  // Handle remove image
  const handleRemove = () => {
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageRemove();
  };

  // Handle click to open file dialog
  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={`image-upload ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        disabled={disabled}
      />

      {/* Upload area */}
      <div
        className={`image-upload__area ${dragActive ? 'drag-active' : ''} ${disabled ? 'disabled' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {previewUrl ? (
          // Image preview
          <div className="image-upload__preview">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="image-upload__preview-img"
            />
            <div className="image-upload__preview-overlay">
              <button
                type="button"
                className="image-upload__remove-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                disabled={disabled || uploading}
              >
                Remove
              </button>
              <button
                type="button"
                className="image-upload__replace-btn"
                onClick={handleClick}
                disabled={disabled || uploading}
              >
                Replace
              </button>
            </div>
          </div>
        ) : (
          // Upload prompt
          <div className="image-upload__prompt">
            {uploading ? (
              <div className="image-upload__loading">
                <div className="spinner"></div>
                <p>Uploading...</p>
              </div>
            ) : (
              <>
                <div className="image-upload__icon">📁</div>
                <p className="image-upload__text">
                  {dragActive ? 'Drop image here' : 'Click or drag image to upload'}
                </p>
                <p className="image-upload__hint">
                  Max {(maxSizeBytes / (1024 * 1024)).toFixed(1)}MB • JPG, PNG, WebP, SVG
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="image-upload__error">
          {error}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
