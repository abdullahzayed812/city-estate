import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_SERVER_IP, SERVER_IP_KEY } from '../store/configStore';

export const api = axios.create({
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const ip = await AsyncStorage.getItem(SERVER_IP_KEY) ?? DEFAULT_SERVER_IP;
  config.baseURL = `http://${ip}:8080/api`;

  const token = await AsyncStorage.getItem('access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await AsyncStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        const ip = await AsyncStorage.getItem(SERVER_IP_KEY) ?? DEFAULT_SERVER_IP;
        const { data } = await axios.post(`http://${ip}:8080/api/auth/refresh`, { refreshToken });
        await AsyncStorage.multiSet([
          ['access_token', data.data.accessToken],
          ['refresh_token', data.data.refreshToken],
        ]);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        }
        return api(originalRequest);
      } catch {
        await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
      }
    }

    return Promise.reject(error);
  },
);
