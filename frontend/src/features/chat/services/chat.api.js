import axios from "axios";    

const getBackendUrl = () => {
  if (import.meta.env.VITE_BACKEND_URL) return import.meta.env.VITE_BACKEND_URL;
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  return isLocalhost ? 'http://localhost:3000' : `http://${window.location.hostname}:3000`;
};
const BACKEND_URL = getBackendUrl();

const api = axios.create({
    baseURL: BACKEND_URL,
    withCredentials: true,
});

export const sendMessage = async ({ message, chatId, modelName, images }) => {
    const response = await api.post('/api/chats/message', { message, chat: chatId, modelName, images });
    return response.data;
};

export const getChats = async () => {
    const response = await api.get('/api/chats');
    return response.data;
};

export const getMessages = async (chatId) => {
    const response = await api.get(`/api/chats/${chatId}/messages`);
    return response.data;
};

export const deleteChat = async (chatId) => {
    const response = await api.delete(`/api/chats/delete/${chatId}`);
    return response.data;
};

export const renameChat = async (chatId, title) => {
    const response = await api.patch(`/api/chats/rename/${chatId}`, { title });
    return response.data;
};

export const deleteAllChats = async () => {
    const response = await api.delete('/api/chats/delete-all');
    return response.data;
};