import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io;

function getCookie(rawCookie, name) {
    if (!rawCookie) return null;
    for (const part of rawCookie.split(';')) {
        const c = part.trim();
        const i = c.indexOf('=');
        if (i !== -1 && c.slice(0, i) === name) {
            return decodeURIComponent(c.slice(i + 1));
        }
    }
    return null;
}

export function initSocket(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: ["http://localhost:5173", "http://localhost:5174", "https://inquiro-ten-roan.vercel.app", process.env.FRONTEND_URL].filter(Boolean),
            credentials: true,
        }
    });

    // Authenticate every socket from the JWT cookie sent during the handshake.
    io.use((socket, next) => {
        try {
            const token = getCookie(socket.handshake.headers.cookie, "token");
            if (!token) return next(new Error("Authentication required"));

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;
            next();
        } catch (err) {
            next(new Error("Invalid authentication token"));
        }
    });

    io.on("connection", (socket) => {
        // Put the user in a private room so we can stream only to them.
        socket.join(socket.userId);
        console.log("A user connected:", socket.id, "→ room:", socket.userId);
    });

    console.log("Socket.io server initialized");
}

export function getIO() {
    if (!io) {
        throw new Error("Socket.io not initialized");
    }
    return io;
}