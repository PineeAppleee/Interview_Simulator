import logger from '../utils/logger';
import { callOpenRouter } from '../index_logic';

export interface EvaluationResult {
  score: number;
  feedback: string;
  missing_points: string[];
  conversational_response: string;
}

export class EvaluationService {
  async evaluateAnswer(question: string, transcript: string, remainingTimeMinutes: number): Promise<EvaluationResult> {
    const systemPrompt = `You are an expert technical interviewer. You are conducting a 30-minute interview. 
Current Time Remaining: ${remainingTimeMinutes} minutes. 
Pacing Strategy:
- If > 20 mins: Dig deep into projects and technical basics.
- If 10-20 mins: Focus on advanced scenarios and high-level architecture.
- If 5-10 mins: Move to behavioral questions.
- If < 5 mins: Start wrapping up and ask if they have any questions for you.

Keep responses structured and concise.`;

    const prompt = `
Evaluate the candidate's answer to the following question.

Question: "${question}"
Candidate Answer: "${transcript}"

Provide your evaluation in the following JSON format EXACTLY. Do not include markdown code blocks or any other text.
{
  "score": <number between 0-100 representing percentage quality, OR -1 if the candidate's response is just a conversational filler, interruption, or lacks any technical content to evaluate>,
  "feedback": "<internal feedback for the evaluation report>",
  "missing_points": ["<point 1>", "<point 2>"],
  "conversational_response": "<A warm, professional conversational response. Acknowledge their answer AND THEN ASK THE NEXT QUESTION. Adapt your pacing because only ${remainingTimeMinutes} minutes remain in this 30-minute slot.>"
}
`;

    try {
      const responseText = await callOpenRouter(prompt, systemPrompt);
      const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

      const result = JSON.parse(cleanedText);
      return {
        score: result.score || 0,
        feedback: result.feedback || "Good effort.",
        missing_points: result.missing_points || [],
        conversational_response: result.conversational_response || "Thank you. Let's move to the next question."
      };
    } catch (error) {
      logger.error("Evaluation failed due to parsing or API error", error);
      return {
        score: 5,
        feedback: "Could not completely evaluate the answer due to a system glitch.",
        missing_points: ["N/A"],
        conversational_response: "I see. That's an interesting perspective. Moving forward, can you tell me about..."
      };
    }
  }
}
