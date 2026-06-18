import axios from 'axios';

const getBackendUrl = () => {
  if (import.meta.env.VITE_BACKEND_URL) return import.meta.env.VITE_BACKEND_URL;
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  return isLocalhost ? 'http://localhost:3000' : `http://${window.location.hostname}:3000`;
};
const BACKEND_URL = getBackendUrl();

const authApi = axios.create({
  baseURL: `${BACKEND_URL}/api/auth`,
  withCredentials: true,
});

export async function register({ username, email, password }) {
  const response = await authApi.post('/register', { username, email, password });
  return response.data;
}

export async function login({ email, password }) {
  const response = await authApi.post('/login', { email, password });
  return response.data;
}

export async function logout() {
  const response = await authApi.post('/logout');
  return response.data;
}

export async function resendVerification({ email }) {
  const response = await authApi.post('/resend-verification', { email });
  return response.data;
}

export async function getMe() {
  const response = await authApi.get('/get-me');
  return response.data;
}

export async function updateSystemPrompt({ systemPrompt }) {
  const response = await authApi.patch('/system-prompt', { systemPrompt });
  return response.data;
}