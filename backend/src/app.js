import express from "express";
// import "express-async-errors"; // makes async controller errors reach the handler below
import cookieParser from "cookie-parser";

import authRouter from "../routers/auth.router.js";
import chatRouter from "../routers/chat.routes.js";

import morgan from "morgan";
import cors from "cors";

const app = express();

//MiddleWare
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://inquiro-ten-roan.vercel.app",
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes(origin + '/')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
}));

//HealthCheck
app.get("/", (req, res) => {
    res.json({ message: "Server is running" });
});

app.use("/api/auth", authRouter);
app.use("/api/chats", chatRouter);

// ── 404 for unknown API routes ──
app.use((req, res) => {
    res.status(404).json({ message: "Route not found", success: false });
});

// ── Global error handler (catches anything thrown in async controllers) ──
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    const status = err.status || err.statusCode || 500;
    res.status(status).json({
        message: err.message || "Internal server error",
        success: false,
    });
});

export default app;