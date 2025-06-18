import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const setCookie = (name, value, days = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

const getCookie = (name) => {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const deleteCookie = (name) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

api.interceptors.request.use((config) => {
  const token = getCookie('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);

    if (error.response?.status === 401) {
      deleteCookie('authToken');
      deleteCookie('user');
      window.dispatchEvent(new CustomEvent('auth-logout'));
    }

    return Promise.reject(error);
  },
);

export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.access_token) {
      setCookie('authToken', response.data.access_token, 7);
    }
    return response.data;
  },

  verifyToken: async (token) => {
    const response = await api.post(
      '/auth/verify',
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  },

  logout: () => {
    deleteCookie('authToken');
    deleteCookie('user');
    window.dispatchEvent(new CustomEvent('auth-logout'));
  },
};

export const chatAPI = {
  createChat: async (data) => {
    const response = await api.post('/chat', data);
    return response.data;
  },

  getUserChats: async (userId) => {
    const response = await api.get(`/chat/user/${userId}`);
    return response.data;
  },

  getChatDetail: async (chatId) => {
    const response = await api.get(`/chat/${chatId}`);
    return response.data;
  },

  sendMessage: async (chatId, content) => {
    const response = await api.post(`/chat/${chatId}/message`, { content });
    return response.data;
  },

  sendImageMessage: async (chatId, content, imageData, mimeType) => {
    const response = await api.post(`/chat/${chatId}/image`, {
      content,
      imageData,
      mimeType,
    });
    return response.data;
  },

  sendAudioMessage: async (chatId, content, audioData, mimeType) => {
    const response = await api.post(`/chat/${chatId}/audio`, {
      content,
      audioData,
      mimeType,
    });

    return response.data;
  },

  sendMixedMessage: async (chatId, content) => {
    const response = await api.post(`/chat/${chatId}/ai/mixed`, { content });

    return response.data;
  },

  updateChatTitle: async (chatId, userId, title) => {
    const response = await api.put(`/chat/${chatId}/title?userId=${userId}`, { title });
    return response.data;
  },

  deleteChat: async (chatId, userId) => {
    const response = await api.delete(`/chat/${chatId}?userId=${userId}`);
    return response.data;
  },
};

export const profileAPI = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  getPersonalInformation: async () => {
    const response = await api.get('/users/personal-information');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const cleanData = Object.fromEntries(
      Object.entries(profileData).filter(([key, value]) => value !== undefined && value !== null && value !== ''),
    );

    const response = await api.patch('/users/profile', cleanData);
    return response.data;
  },

  updatePersonalInformation: async (personalData) => {
    const cleanData = Object.fromEntries(
      Object.entries(personalData).filter(([key, value]) => value !== undefined && value !== null && value !== ''),
    );
    const response = await api.patch('/users/information', cleanData);
    return response.data;
  },

  updateHealth: async (healthData) => {
    const cleanData = Object.fromEntries(
      Object.entries(healthData).filter(([key, value]) => {
        if (Array.isArray(value)) return true;
        return value !== undefined && value !== null && value !== '';
      }),
    );
    const response = await api.patch('/users/health', cleanData);
    return response.data;
  },

  deleteAccount: async () => {
    const response = await api.delete('/users/delete-account');
    return response.data;
  },

  changePassword: async (userId, passwordData) => {
    const response = await api.patch('/users/profile', { password: passwordData.new_password });
    return response.data;
  },
};

export const nutritionAPI = {
  getDailyStats: async (date) => {
    const params = date ? `?date=${date}` : '';
    const response = await api.get(`/nutrition/daily-stats${params}`);
    return response.data;
  },

  getWeeklyStats: async (weekStart) => {
    const params = weekStart ? `?weekStart=${weekStart}` : '';
    const response = await api.get(`/nutrition/weekly-stats${params}`);
    return response.data;
  },

  getMonthlyStats: async (year, month) => {
    const params = new URLSearchParams();
    if (year) params.append('year', year);
    if (month) params.append('month', month);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get(`/nutrition/monthly-stats${queryString}`);
    return response.data;
  },

  getDailyChartData: async (days = 7) => {
    const response = await api.get(`/nutrition/chart-data/daily?days=${days}`);
    return response.data;
  },

  getWeeklyChartData: async (weeks = 4) => {
    const response = await api.get(`/nutrition/chart-data/weekly?weeks=${weeks}`);
    return response.data;
  },

  getMonthlyChartData: async (months = 3) => {
    const response = await api.get(`/nutrition/chart-data/monthly?months=${months}`);
    return response.data;
  },

  getNutritionBreakdown: async (date) => {
    const params = date ? `?date=${date}` : '';
    const response = await api.get(`/nutrition/nutrition-breakdown${params}`);
    return response.data;
  },

  getFoodEntries: async (startDate, endDate) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get(`/nutrition/food-entries${queryString}`);
    return response.data;
  },

  deleteFoodEntry: async (entryId) => {
    const response = await api.delete(`/nutrition/food-entries/${entryId}`);
    return response.data;
  },

  updateFoodEntry: async (entryId, updateData) => {
    const response = await api.put(`/nutrition/food-entries/${entryId}`, updateData);
    return response.data;
  },

  parseFood: async (content, messageId) => {
    const response = await api.post('/nutrition/parse-food', { content, messageId });
    return response.data;
  },
};

export default api;
