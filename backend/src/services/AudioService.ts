import fs from 'fs';
import path from 'path';
import logger from '../utils/logger';
import { convertToWav, transcribeAudio, transcribeWithDeepgram } from '../transcriber';

export class AudioService {
  private tempDir = path.join(process.cwd(), 'tmp');

  constructor() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  async processAudio(sessionId: string, chunks: Buffer[]): Promise<string> {
    const audioBuffer = Buffer.concat(chunks);
    const fileName = `${sessionId}-${Date.now()}.webm`;
    const filePath = path.join(this.tempDir, fileName);

    try {
      fs.writeFileSync(filePath, audioBuffer);
      logger.info(`Audio saved for session ${sessionId}: ${fileName}`);

      return await this.transcribeWithRetry(filePath);
    } catch (error) {
      logger.error(`Audio processing failed for ${sessionId}`, error);
      throw error;
    }
  }

  private async transcribeWithRetry(filePath: string, retries = 2): Promise<string> {
    try {
      if (process.env.DEEPGRAM_API_KEY) {
        return await transcribeWithDeepgram(filePath, "audio/webm");
      } else {
        const wavPath = await convertToWav(filePath);
        return await transcribeAudio(wavPath);
      }
    } catch (error) {
      if (retries > 0) {
        logger.warn(`Transcription failed, retrying... (${retries} left)`);
        return this.transcribeWithRetry(filePath, retries - 1);
      }
      throw error;
    }
  }
}
