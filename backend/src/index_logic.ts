import axios from "axios";
import { env } from "./config/env";
import logger from "./utils/logger";

export const QUESTION_BANK = [
  "Tell me about a challenging bug you fixed and how you approached it.",
  "Describe a time when you had to balance speed and quality. What did you do?",
  "How do you handle disagreements within a product or engineering team?",
  "What metric do you rely on most in your current role, and why?",
  "Walk me through a project where you significantly improved user experience."
];

export function getPhaseByTurn(turnIndex: number, maxTurns: number): any {
  if (turnIndex <= 0) return "intro";
  const lastIndex = Math.max(0, maxTurns - 1);
  if (turnIndex >= lastIndex) return "wrapup";
  if (turnIndex <= 2) return "projects";
  if (turnIndex <= 4) return "technical";
  if (turnIndex <= 6) return "behavioral";
  return "scenario";
}

export function extractKeyFacts(transcript: string): string {
  const t = (transcript || "").trim();
  if (!t) return "";
  return ""; 
}

export async function callOpenRouter(prompt: string, systemPrompt?: string) {
  const OPENROUTER_KEY = env.OPENROUTER_API_KEY;

  if (!OPENROUTER_KEY) {
    logger.error("OPENROUTER_API_KEY missing");
    throw new Error("OPENROUTER_API_KEY not configured");
  }

  try {
    const payload = {
      model: "openrouter/auto",
      messages: [
        { role: "system", content: systemPrompt ?? "You are an interviewer and evaluator." },
        { role: "user", content: prompt }
      ],
      max_tokens: 600
    };

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      payload,
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_KEY}`,
          "X-Title": "Interview Simulator"
        },
        timeout: 30000
      }
    );

    // --- DEBUG LOG: RAW HTTPS RESPONSE ---
    console.log("\n🌐 [RAW HTTPS RESPONSE FROM OPENROUTER]");
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log("Response Body:", JSON.stringify(response.data, null, 2));
    console.log("------------------------------------------\n");

    return response.data?.choices?.[0]?.message?.content;
  } catch (err: any) {
    console.error("\n❌ [HTTPS ERROR RESPONSE]");
    if (err.response) {
      console.error(`Status: ${err.response.status}`);
      console.error("Error Data:", JSON.stringify(err.response.data, null, 2));
    } else {
      console.error("Message:", err.message);
    }
    console.error("---------------------------\n");
    throw err;
  }
}

export async function evaluateAnswer(prompt: string, transcript: string) {
  try {
    const llmText = await callOpenRouter(prompt);
    const start = llmText.indexOf("{");
    const jsonStr = start >= 0 ? llmText.substring(start) : llmText;
    return JSON.parse(jsonStr);
  } catch (err: any) {
    return { score: 3, feedback: "Mock feedback (Evaluation Service Error)", pass: true };
  }
}

export async function getNextQuestionFromLLM(session: any) {
  const prompt = `Based on the interview so far (Role: ${session.role}), ask the next relevant question. Phase: ${session.phase}.`;
  try {
    const response = await callOpenRouter(prompt);
    return response || "Can you tell me more about your recent project?";
  } catch (err) {
    return "Can you tell me more about your recent project?";
  }
}
