import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: BASE_URL });

// ── Auth interceptor — attach JWT on every request ───────
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('smartration_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch (_) {}
  return config;
});

// ── Response interceptor — redirect to login on 401 ──────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      try {
        localStorage.removeItem('smartration_token');
        localStorage.removeItem('smartration_user');
      } catch (_) {}
      // Signal to App.jsx to navigate to login
      window.dispatchEvent(new Event('auth:logout'));
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────
export const authAPI = {
  sendOTP:       (phone)        => api.post('/auth/send-otp',    { phone }),
  verifyOTP:     (phone, otp)   => api.post('/auth/verify-otp',  { phone, otp }),
  getMe:         ()             => api.get('/auth/me'),
  updateProfile: (data)         => api.put('/auth/profile', data),
};

// ── Booking ───────────────────────────────────────────────
export const bookingAPI = {
  getSlots:        (shopId)                    => api.get(`/booking/slots?shop_id=${shopId}`),
  getEntitlements: (shopId)                    => api.get(`/booking/entitlements?shop_id=${shopId}`),
  create:          (data)                      => api.post('/booking/book', data),
  getMyBookings:   ()                          => api.get('/booking/my-bookings'),
  getById:         (id)                        => api.get(`/booking/${id}`),
  cancel:          (id)                        => api.put(`/booking/${id}/cancel`),
  verifyToken:     (token, shopId, date)       => api.get(`/booking/verify/${token}?shop_id=${shopId}&date=${date}`),
  getQueueToday:   (shopId, date)              => api.get(`/booking/queue-today?shop_id=${shopId}&date=${date}`),
  getMyPosition:   (shopId, date, token)       => api.get(`/booking/my-position?shop_id=${shopId}&date=${date}&token=${token}`),
};

// ── Queue ─────────────────────────────────────────────────
export const queueAPI = {
  getStatus:   (shopId, date)         => api.get(`/queue/status?shop_id=${shopId}&date=${date}`),
  getWaitTime: (shopId, date, token)  => api.get(`/queue/wait?shop_id=${shopId}&date=${date}&token=${token}`),
  callNext:    (shopId, date)         => api.post('/queue/call-next', { shop_id: shopId, date }),
  markServed:  (shopId, token, date)  => api.post('/queue/serve', { shop_id: shopId, token_number: token, date }),
  getLogs:     (shopId, date)         => api.get(`/queue/logs?shop_id=${shopId}&date=${date}`),
};

// ── Stock ─────────────────────────────────────────────────
export const stockAPI = {
  getByShop:    (shopId)          => api.get(`/stock?shop_id=${shopId}`),
  add:          (data)            => api.post('/stock', data),
  update:       (id, data)        => api.put(`/stock/${id}`, data),
  restock:      (id, quantity)    => api.put(`/stock/${id}/restock`, { quantity }),
  delete:       (id)              => api.delete(`/stock/${id}`),
  getLowAlerts: (shopId)          => api.get(`/stock/low-alert${shopId ? `?shop_id=${shopId}` : ''}`),
};

// ── Welfare ───────────────────────────────────────────────
export const welfareAPI = {
  getAlerts:    (params = {})   => api.get('/welfare/alerts', { params }),
  getMyAlerts:  ()              => api.get('/welfare/alerts/my'),
  resolve:      (id)            => api.put(`/welfare/alerts/${id}/resolve`),
  resolveBulk:  (ids)           => api.put('/welfare/alerts/resolve-bulk', { ids }),
  runChecks:    ()              => api.post('/welfare/run-checks'),
  getSummary:   ()              => api.get('/welfare/summary'),
};

// ── Ration Card ───────────────────────────────────────────
export const rationCardAPI = {
  register:  (data)   => api.post('/ration-card/register', data),  // was '/ration-card'
  getMyCard: ()       => api.get('/ration-card/my'),
  update:    (data)   => api.put('/ration-card/my', data),
};
// ── Shops ─────────────────────────────────────────────────
export const shopAPI = {
  getAll:   ()    => api.get('/shops'),
  getById:  (id)  => api.get(`/shops/${id}`),
};

export default api;