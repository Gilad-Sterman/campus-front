import api from './api.js';

const conciergeApi = {
  // Get calendar connection status
  getCalendarStatus: async () => {
    const response = await api.get('/concierge/calendar/status');
    return response.data;
  },

  // Initiate Google Calendar OAuth connection
  connectCalendar: async () => {
    const response = await api.post('/concierge/calendar/connect');
    return response.data;
  },

  // Complete calendar connection with OAuth code
  completeCalendarConnection: async (code) => {
    const response = await api.post('/concierge/calendar/complete', { code });
    return response.data;
  },

  // Disconnect calendar
  disconnectCalendar: async () => {
    const response = await api.delete('/concierge/calendar/disconnect');
    return response.data;
  },

  // Get concierge's appointments
  getAppointments: async (params = {}) => {
    const response = await api.get('/concierge/appointments', { params });
    return response.data;
  },

  // Update appointment status
  updateAppointmentStatus: async (appointmentId, status, notes) => {
    const response = await api.put(`/concierge/appointments/${appointmentId}/status`, { status, notes });
    return response.data;
  },

  // Student-facing: get available concierges
  getAvailableConcierges: async () => {
    const response = await api.get('/concierge/list');
    return response.data;
  },

  // Student-facing: get available time slots
  getAvailableSlots: async (conciergeId, startDate, endDate) => {
    const response = await api.get('/concierge/availability', {
      params: { conciergeId, startDate, endDate }
    });
    return response.data;
  },

  // Student-facing: get my appointments
  getMyAppointments: async () => {
    const response = await api.get('/concierge/my-appointments');
    return response.data;
  },

  // Student-facing: book an appointment
  bookAppointment: async (conciergeUserId, startTime, notes) => {
    const response = await api.post('/concierge/book', { conciergeUserId, startTime, notes });
    return response.data;
  }
};

export default conciergeApi;
