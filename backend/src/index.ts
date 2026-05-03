import express from "express";
import http from "http";
import { Server as IOServer } from "socket.io";
import cors from "cors";

import { env } from "./config/env";
import logger from "./utils/logger";
import { errorHandler } from "./middlewares/errorHandler";

import { UserRepository } from "./repositories/UserRepository";
import { InterviewRepository } from "./repositories/InterviewRepository";
import { AuthService } from "./services/AuthService";
import { InterviewService } from "./services/InterviewService";
import { SessionService } from "./services/SessionService";
import { AudioService } from "./services/AudioService";
import { EvaluationService } from "./services/EvaluationService";

import { AuthController } from "./controllers/AuthController";
import { InterviewController } from "./controllers/InterviewController";
import { setupAuthRoutes } from "./routes/authRoutes";
import { setupInterviewRoutes } from "./routes/interviewRoutes";
import { setupInterviewSocket } from "./sockets/interviewHandler";

// 1. Initialize MOCK Repositories
const userRepo = new UserRepository();
const interviewRepo = new InterviewRepository();

// 2. Initialize Services
const authService = new AuthService();
const interviewService = new InterviewService(interviewRepo);
const sessionService = new SessionService();
const audioService = new AudioService();
const evaluationService = new EvaluationService();

// 3. Initialize Controllers
const authController = new AuthController(authService, userRepo);
const interviewController = new InterviewController(interviewService);

// 4. Setup Express
const app = express();
app.use(cors());
app.use(express.json());

// 5. Setup Routes
app.use("/api/auth", setupAuthRoutes(authController));
app.use("/api/interviews", setupInterviewRoutes(interviewController, authService));

// 6. Global Error Handler
app.use(errorHandler);

// 7. Setup HTTP & Socket.io
const server = http.createServer(app);
const io = new IOServer(server, {
  cors: { origin: "*" },
  pingTimeout: 60000,
  pingInterval: 25000
});

setupInterviewSocket(io as any, sessionService, audioService, evaluationService);

// Groq API Connection Test on Startup
const testGroq = async () => {
  const axios = require('axios');
  const key = process.env.GROQ_API_KEY;
  console.log('\n--- Groq API Connection Test ---');
  if (!key) {
    console.log('❌ GROQ_API_KEY is missing from .env');
    return;
  }
  try {
    const res = await axios.get('https://api.groq.com/openai/v1/models', {
      headers: { 'Authorization': `Bearer ${key}` }
    });
    console.log(`✅ Success! Groq API is responding (Status: ${res.status})`);
  } catch (err: any) {
    console.log(`❌ Groq API Error (Status: ${err.response?.status || 'N/A'}): ${err.message}`);
    if (err.response?.data) console.log('Details:', JSON.stringify(err.response.data));
  }
  console.log('--------------------------------\n');
};
testGroq();

// 8. Start Server
if (require.main === module) {
  server.listen(0, () => {
    const address = server.address();
    const port = typeof address === 'string' ? address : address?.port;
    logger.info(`🚀 Senior-Architect backend (Resilience Mode) listening on port ${port}`);

    // Write port to frontend config so it can connect automatically
    try {
      const fs = require('fs');
      const path = require('path');
      const configPath = path.join(__dirname, '../../frontend/src/backend-config.json');
      fs.writeFileSync(configPath, JSON.stringify({ port }));
      logger.info(`Updated frontend config with port ${port}`);
    } catch (err) {
      logger.error('Failed to write backend-config.json', err);
    }
  });
}

export { server, io, sessionService, interviewService, evaluationService, audioService };
