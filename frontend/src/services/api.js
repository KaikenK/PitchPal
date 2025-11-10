import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Founder API
export const founderAPI = {
  getAll: () => api.get('/founder'),
  getById: (id) => api.get(`/founder/${id}`),
  getStartups: (id) => api.get(`/founder/${id}/startups`),
  getStartupCount: (id) => api.get(`/founder/${id}/startup-count`),
  getMatches: (founderId, startupId) => api.get(`/founder/${founderId}/startup/${startupId}/matches`),
  getPitches: (id) => api.get(`/founder/${id}/pitches`),
  getMessages: (id) => api.get(`/founder/${id}/messages`),
  create: (data) => api.post('/founder', data),
  update: (id, data) => api.put(`/founder/${id}`, data),
  delete: (id) => api.delete(`/founder/${id}`),
};

// Investor API
export const investorAPI = {
  getAll: () => api.get('/investor'),
  getById: (id) => api.get(`/investor/${id}`),
  getDomains: (id) => api.get(`/investor/${id}/domains`),
  getStartups: (id) => api.get(`/investor/${id}/startups`),
  getFundingRounds: (id) => api.get(`/investor/${id}/funding-rounds`),
  getTotalInvestment: (id) => api.get(`/investor/${id}/total-investment`),
  getApprovalStatus: (id) => api.get(`/investor/${id}/approval-status`),
  getPitches: (id) => api.get(`/investor/${id}/pitches`),
  getMessages: (id) => api.get(`/investor/${id}/messages`),
  create: (data) => api.post('/investor', data),
  addDomain: (id, domainId) => api.post(`/investor/${id}/domains`, { DomainID: domainId }),
  update: (id, data) => api.put(`/investor/${id}`, data),
  delete: (id) => api.delete(`/investor/${id}`),
};

// Admin API
export const adminAPI = {
  getAll: () => api.get('/admin'),
  getById: (id) => api.get(`/admin/${id}`),
  getPendingApprovals: () => api.get('/admin/approvals/pending'),
  getAllApprovals: () => api.get('/admin/approvals/all'),
  createApproval: (data) => api.post('/admin/approvals', data),
  updateApproval: (id, data) => api.put(`/admin/approvals/${id}`, data),
  getAllMessages: () => api.get('/admin/messages/all'),
  getUnmoderatedMessages: () => api.get('/admin/messages/unmoderated'),
  moderateMessage: (data) => api.post('/admin/messages/moderate', data),
  getAllModerations: () => api.get('/admin/moderations/all'),
  create: (data) => api.post('/admin', data),
  update: (id, data) => api.put(`/admin/${id}`, data),
  delete: (id) => api.delete(`/admin/${id}`),
};

// Startup API
export const startupAPI = {
  getAll: () => api.get('/startup'),
  getById: (id) => api.get(`/startup/${id}`),
  getFundingRounds: (id) => api.get(`/startup/${id}/funding-rounds`),
  getPitches: (id) => api.get(`/startup/${id}/pitches`),
  create: (data) => api.post('/startup', data),
  update: (id, data) => api.put(`/startup/${id}`, data),
  delete: (id) => api.delete(`/startup/${id}`),
};

// Funding API
export const fundingAPI = {
  getAll: () => api.get('/funding'),
  getById: (id) => api.get(`/funding/${id}`),
  create: (data) => api.post('/funding', data),
  update: (id, data) => api.put(`/funding/${id}`, data),
  delete: (id) => api.delete(`/funding/${id}`),
};

// Domain API
export const domainAPI = {
  getAll: () => api.get('/domain'),
  getById: (id) => api.get(`/domain/${id}`),
  getStartups: (id) => api.get(`/domain/${id}/startups`),
  create: (data) => api.post('/domain', data),
  update: (id, data) => api.put(`/domain/${id}`, data),
  delete: (id) => api.delete(`/domain/${id}`),
};

// PitchMatch API
export const pitchMatchAPI = {
  getAll: () => api.get('/pitchmatch'),
  getById: (id) => api.get(`/pitchmatch/${id}`),
  create: (data) => api.post('/pitchmatch', data),
  update: (id, data) => api.put(`/pitchmatch/${id}`, data),
  delete: (id) => api.delete(`/pitchmatch/${id}`),
};

// Message API
export const messageAPI = {
  getAll: () => api.get('/message'),
  getById: (id) => api.get(`/message/${id}`),
  getConversation: (type1, id1, type2, id2) => 
    api.get(`/message/conversation/${type1}/${id1}/${type2}/${id2}`),
  send: (data) => api.post('/message', data),
  delete: (id) => api.delete(`/message/${id}`),
};

// Analytics API
export const analyticsAPI = {
  getStartupsPerDomain: () => api.get('/analytics/startups-per-domain'),
  getFoundersStartupCount: () => api.get('/analytics/founders-startup-count'),
  getLatestFundingRounds: (limit = 10) => api.get(`/analytics/latest-funding-rounds?limit=${limit}`),
  getTotalFundingPerStartup: () => api.get('/analytics/total-funding-per-startup'),
  getTopInvestors: (limit = 10) => api.get(`/analytics/top-investors?limit=${limit}`),
  getFundingTrends: () => api.get('/analytics/funding-trends'),
  getStartupStageDistribution: () => api.get('/analytics/startup-stage-distribution'),
  getPitchSuccessRate: () => api.get('/analytics/pitch-success-rate'),
  getDashboardSummary: () => api.get('/analytics/dashboard-summary'),
};

export default api;
