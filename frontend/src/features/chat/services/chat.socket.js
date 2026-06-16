import { io } from "socket.io-client";

let socket = null;

export function connectSocket() {
    if (socket) return socket;
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    socket = io(BACKEND_URL, {
        withCredentials: true,
    });
    return socket;
}

export function getSocket() {
    return socket;
}