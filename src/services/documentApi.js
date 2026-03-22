import api from './api';

// Document API functions using the shared api instance

// Document API functions
export const documentApiService = {
  // Get user's documents
  async getUserDocuments() {
    try {
      const response = await api.get('/documents');
      return response.data;
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  },

  // Upload document with file
  async uploadDocument(file, documentType, applicationId = null) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', documentType);
      if (applicationId) {
        formData.append('application_id', applicationId);
      }

      const response = await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  // Get virus scanner status
  async getScannerStatus() {
    try {
      const response = await api.get('/documents/scan-status');
      return response.data;
    } catch (error) {
      console.error('Error getting scanner status:', error);
      throw error;
    }
  },

  // Update document
  async updateDocument(id, updateData) {
    try {
      const response = await api.put(`/documents/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  },

  // Delete document
  async deleteDocument(id) {
    try {
      const response = await api.delete(`/documents/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },

  // Get document view URL (signed URL for S3)
  async getDocumentViewUrl(documentId) {
    try {
      const response = await api.get(`/documents/${documentId}/view-url`);
      return response.data;
    } catch (error) {
      console.error('Error getting document view URL:', error);
      throw error;
    }
  }
};
