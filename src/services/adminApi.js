import api from './api';

const adminApi = {
    // =============================================
    // DASHBOARD
    // =============================================
    getDashboardStats: async (startDate, endDate) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        const query = params.toString() ? `?${params.toString()}` : '';
        return api.get(`/admin/dashboard${query}`);
    },

    // =============================================
    // USERS
    // =============================================
    getUsers: async ({ page = 1, limit = 20, search = '', status = '' } = {}) => {
        const params = new URLSearchParams({ page, limit });
        if (search) params.append('search', search);
        if (status) params.append('status', status);
        return api.get(`/admin/users?${params.toString()}`);
    },

    getUserById: async (userId) => {
        return api.get(`/admin/users/${userId}`);
    },

    updateUserStatus: async (userId, status) => {
        return api.put(`/admin/users/${userId}/status`, { status });
    },

    updateUserRole: async (userId, role) => {
        return api.put(`/admin/users/${userId}/role`, { role });
    },

    // =============================================
    // UNIVERSITIES
    // =============================================
    getUniversities: async ({ page = 1, limit = 20, search = '', status = '' } = {}) => {
        const params = new URLSearchParams({ page, limit });
        if (search) params.append('search', search);
        if (status) params.append('status', status);
        return api.get(`/admin/universities?${params.toString()}`);
    },

    createUniversity: async (universityData) => {
        return api.post('/admin/universities', universityData);
    },

    updateUniversity: async (id, updateData) => {
        return api.put(`/admin/universities/${id}`, updateData);
    },

    deleteUniversity: (id) => api.delete(`/admin/universities/${id}`),

    // =============================================
    // STAFF MANAGEMENT
    // =============================================

    // Get staff members (non-student users)
    getStaff: () => api.get('/admin/staff'),

    // Get pending staff invitations
    getStaffInvites: () => api.get('/admin/staff/invites'),

    // Invite new staff member
    inviteStaff: (data) => api.post('/admin/staff/invite', data),

    // Revoke staff invitation
    revokeStaffInvite: (inviteId) => api.delete(`/admin/staff/invites/${inviteId}`),

    // Update staff member role
    updateStaffRole: (staffId, role) => api.put(`/admin/staff/${staffId}/role`, { role }),

    // =============================================
    // PROGRAMS
    // =============================================
    getPrograms: async ({ page = 1, limit = 20, search = '', universityId = '', discipline = '', status = '' } = {}) => {
        const params = new URLSearchParams({ page, limit });
        if (search) params.append('search', search);
        if (universityId) params.append('universityId', universityId);
        if (discipline) params.append('discipline', discipline);
        if (status) params.append('status', status);
        return api.get(`/admin/programs?${params.toString()}`);
    },

    createProgram: async (programData) => {
        return api.post('/admin/programs', programData);
    },

    updateProgram: async (id, updateData) => {
        return api.put(`/admin/programs/${id}`, updateData);
    },

    deleteProgram: async (id) => {
        return api.delete(`/admin/programs/${id}`);
    },

    bulkImportPrograms: async (programs) => {
        return api.post('/admin/programs/bulk-import', { programs });
    },

    // =============================================
    // COMMUNITY CONFIGS
    // =============================================
    getCommunityConfigs: async () => {
        return api.get('/admin/community');
    },

    upsertCommunityConfig: async (configData) => {
        return api.post('/admin/community', configData);
    },

    deleteCommunityConfig: async (id) => {
        return api.delete(`/admin/community/${id}`);
    },

    // =============================================
    // AUDIT LOGS
    // =============================================
    getAuditLogs: async ({ page = 1, limit = 50, action = '', userId = '' } = {}) => {
        const params = new URLSearchParams({ page, limit });
        if (action) params.append('action', action);
        if (userId) params.append('userId', userId);
        return api.get(`/admin/audit-logs?${params.toString()}`);
    },
    completeStaffOnboarding: async (data) => {
        // Extract access token from data and set it as Authorization header
        const { accessToken, ...requestData } = data;
        
        const config = accessToken ? {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        } : {};
        
        return api.post('/admin/staff/onboarding', requestData, config);
    }
};

export default adminApi;
