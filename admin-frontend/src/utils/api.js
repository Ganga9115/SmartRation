import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('smartration_admin_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch (_) {}
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('smartration_admin_token');
      localStorage.removeItem('smartration_admin_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const adminAuthAPI = {
  sendOTP:       (phone)      => api.post('/auth/send-otp',   { phone }),
  verifyOTP:     (phone, otp) => api.post('/auth/verify-otp', { phone, otp }),
  getMe:         ()           => api.get('/auth/me'),
  updateProfile: (data)       => api.put('/auth/profile', data),
};

export const adminStockAPI = {
  getByShop:  (shopId)      => api.get(`/stock?shop_id=${shopId}`),
  getLowAlert:(shopId)      => api.get(`/stock/low-alert${shopId ? `?shop_id=${shopId}` : ''}`),
  add:        (data)        => api.post('/stock', data),
  update:     (id, data)    => api.put(`/stock/${id}`, data),
  restock:    (id, qty)     => api.put(`/stock/${id}/restock`, { quantity: qty }),
  delete:     (id)          => api.delete(`/stock/${id}`),
};

export const adminQueueAPI = {
  getStatus:  (shopId, date)        => api.get(`/queue/status?shop_id=${shopId}&date=${date}`),
  getWait:    (shopId, date, token) => api.get(`/queue/wait?shop_id=${shopId}&date=${date}&token=${token}`),
  callNext:   (shopId, date)        => api.post('/queue/call-next', { shop_id: shopId, date }),
  markServed: (shopId, token, date) => api.post('/queue/serve', { shop_id: shopId, token_number: token, date }),
  getLogs:    (shopId, date)        => api.get(`/queue/logs?shop_id=${shopId}&date=${date}`),
};

export const adminShopsAPI = {
  getAll:  ()         => api.get('/shops'),
  getById: (id)       => api.get(`/shops/${id}`),
  create:  (data)     => api.post('/shops', data),
  update:  (id, data) => api.put(`/shops/${id}`, data),
};

export const adminWelfareAPI = {
  getAlerts:   (params) => api.get('/welfare/alerts', { params }),
  getSummary:  ()       => api.get('/welfare/summary'),
  runChecks:   ()       => api.post('/welfare/run-checks'),
  resolveAlert:(id)     => api.put(`/welfare/alerts/${id}/resolve`),
  resolveBulk: (ids)    => api.put('/welfare/alerts/resolve-bulk', { ids }),
};

export const adminEventsAPI = {
  getAll:    ()           => api.get('/events'),
  create:    (data)       => api.post('/events', data),
  update:    (id, data)   => api.put(`/events/${id}`, data),
  delete:    (id)         => api.delete(`/events/${id}`),
  getTokens: (id, params) => api.get(`/events/${id}/tokens`, { params }),
  markUsed:  (eId, tId)   => api.post(`/events/${eId}/tokens/${tId}/mark-used`),
};

export default api;