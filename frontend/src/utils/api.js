import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  sendOTP:       (phone)      => api.post('/auth/send-otp',   { phone }),
  verifyOTP:     (phone, otp) => api.post('/auth/verify-otp', { phone, otp }),
  getMe:         ()           => api.get('/auth/me'),
  updateProfile: (data)       => api.put('/auth/profile', data),
};

export const rationCardAPI = {
  register:  (data) => api.post('/ration-card', data),
  getMyCard: ()     => api.get('/ration-card/my'),
  update:    (data) => api.put('/ration-card/my', data),
};

export const shopAPI = {
  getAll:  ()   => api.get('/shops'),
  getById: (id) => api.get(`/shops/${id}`),
};

export const bookingAPI = {
  getSlots:        (shopId)              => api.get(`/booking/slots?shop_id=${shopId}`),
  getEntitlements: (shopId)              => api.get(`/booking/entitlements?shop_id=${shopId}`),
  create:          (data)                => api.post('/booking/book', data),
  getMyBookings:   ()                    => api.get('/booking/my-bookings'),
  getById:         (id)                  => api.get(`/booking/${id}`),
  cancel:          (id)                  => api.put(`/booking/${id}/cancel`),
  verify:          (token, shopId, date) => api.get(`/booking/verify/${token}?shop_id=${shopId}&date=${date}`),
  getQueueToday:   (shopId, date)        => api.get(`/booking/queue-today?shop_id=${shopId}&date=${date}`),
  getMyPosition:   (shopId, date, token) => api.get(`/booking/my-position?shop_id=${shopId}&date=${date}&token=${token}`),
};

export const stockAPI = {
  getByShop: (shopId) => api.get(`/stock?shop_id=${shopId}`),
};

export const queueAPI = {
  getStatus:   (shopId, date)        => api.get(`/queue/status?shop_id=${shopId}&date=${date}`),
  getWaitTime: (shopId, date, token) => api.get(`/queue/wait?shop_id=${shopId}&date=${date}&token=${token}`),
};

export const welfareAPI = {
  getMyAlerts: () => api.get('/welfare/alerts/my'),
};

export default api;