import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

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