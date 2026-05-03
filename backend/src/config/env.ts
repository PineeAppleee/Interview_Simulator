// src/config/env.ts
import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: process.env.PORT || '8084',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret',
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  DEEPGRAM_API_KEY: process.env.DEEPGRAM_API_KEY,
  NODE_ENV: process.env.NODE_ENV || 'development',
};

// Simple validation
if (!env.OPENROUTER_API_KEY) {
  console.warn("⚠️ OPENROUTER_API_KEY is missing in .env");
}
