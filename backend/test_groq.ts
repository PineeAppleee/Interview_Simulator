import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/models';

async function testGroqKey() {
  console.log('--- Groq API Key Test ---');
  if (!GROQ_API_KEY) {
    console.error('❌ GROQ_API_KEY is missing in .env');
    return;
  }

  console.log(`Using Key: ${GROQ_API_KEY.slice(0, 10)}...`);

  try {
    const response = await axios.get(GROQ_API_URL, {
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
    });
    console.log('✅ Success! API Key is valid.');
    console.log('Available models:', response.data.data.slice(0, 3).map((m: any) => m.id).join(', '));
  } catch (error: any) {
    console.error('❌ Error: API Key check failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Details:', error.response.data);
    } else {
      console.error('Message:', error.message);
    }
  }
}

testGroqKey();
