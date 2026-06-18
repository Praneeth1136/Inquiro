import { io } from "socket.io-client";

let socket = null;

export function connectSocket() {
    if (socket) return socket;
    const getBackendUrl = () => {
        if (import.meta.env.VITE_BACKEND_URL) return import.meta.env.VITE_BACKEND_URL;
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        return isLocalhost ? 'http://localhost:3000' : `http://${window.location.hostname}:3000`;
    };
    const BACKEND_URL = getBackendUrl();
    socket = io(BACKEND_URL, {
        withCredentials: true,
    });
    return socket;
}

export function getSocket() {
    return socket;
}

export function disconnectSocket() {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}