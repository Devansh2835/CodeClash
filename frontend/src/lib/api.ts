import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect to login for protected routes, not for auth checks or public pages
      if (typeof window !== 'undefined') {
        const pathname = window.location.pathname || '';
        const isPublicPage = ['/', '/login', '/signup', '/verify-otp'].some((p) => pathname === p);
        const isAuthCheckRequest = error.config?.url?.includes('/auth/me');
        const isLoginRequest = error.config?.url?.includes('/auth/login');
        
        if (!isPublicPage && !isAuthCheckRequest && !isLoginRequest) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const auth = {
  signup: (data: { username: string; email: string; password: string }) =>
    api.post('/auth/signup', data),
  verifyOTP: (data: { email: string; otp: string }) =>
    api.post('/auth/verify-otp', data),
  resendOTP: (data: { email: string }) =>
    api.post('/auth/resend-otp', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  forgotPassword: (data: { email: string }) =>
    api.post('/auth/forgot-password', data),
  resetPassword: (data: { email: string; otp: string; newPassword: string }) =>
    api.post('/auth/reset-password', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

// User endpoints
export const users = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: { username?: string }) =>
    api.put('/users/profile', data),
  getBadges: () => api.get('/users/badges'),
  getMatches: (page = 1) => api.get(`/users/matches?page=${page}`),
  getRemainingBets: () => api.get('/users/bets'),
  connectMetaMask: (address: string) =>
    api.post('/users/connect-metamask', { address }),
};

// Game endpoints
export const game = {
  getLeaderboard: (page = 1) => api.get(`/game/leaderboard?page=${page}`),
  getMatch: (id: string) => api.get(`/game/match/${id}`),
};

// AI endpoints
export const ai = {
  generateProblem: (trophies: number) =>
    api.post('/ai/problem', { trophies }),
  getHint: (problemId: string) => api.post('/ai/hint', { problemId }),
};

export default api;