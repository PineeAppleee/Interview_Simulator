import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

export class TranscriptionService {
  private static GROQ_API_KEY = process.env.GROQ_API_KEY;
  private static GROQ_API_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';

  static async transcribe(audioFilePath: string): Promise<string> {
    if (!this.GROQ_API_KEY) {
      console.warn('GROQ_API_KEY not found in environment variables. Falling back to dummy transcription.');
      return "Transcoding failed: Missing API Key";
    }

    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(audioFilePath));
      formData.append('model', 'whisper-large-v3');
      formData.append('response_format', 'json');
      formData.append('language', 'en');

      const response = await axios.post(this.GROQ_API_URL, formData, {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${this.GROQ_API_KEY}`,
        },
      });

      return response.data.text || '';
    } catch (error: any) {
      console.error('Groq Transcription Error:', error.response?.data || error.message);
      throw new Error('Failed to transcribe audio via Groq');
    }
  }
}
