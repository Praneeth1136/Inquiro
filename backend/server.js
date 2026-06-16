import "dotenv/config";
import app from "./src/app.js";
import connectDB from "./config/database.js";
// import { testAI } from "./services/ai.service.js";

import http from "http";
import { initSocket } from "./src/sockets/server.socket.js";

const httpServer = http.createServer(app);
initSocket(httpServer);


const PORT =  process.env.PORT || 3000;

// testAI();

connectDB()
    .then(() => {
        httpServer.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        })
    })
    .catch((err) => {
        console.error("MongoDB connection failed:", err);
    })