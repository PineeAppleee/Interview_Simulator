import * as readline from 'readline';
import { interviewService, evaluationService, sessionService } from './src/index';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function run() {
  console.log("==========================================");
  console.log(`Starting CLI Mock Interview Simulator (Resilience Mode)`);
  console.log("==========================================\n");

  const interview = await interviewService.createInterview("mock-user", {
    company: "TechNova",
    role: "Architect"
  });

  const session = await sessionService.createSession(interview);
  
  // Mock first question
  session.currentQuestion = "Tell me about your experience building scalable backends.";
  
  const loop = async () => {
    if (session.turnIndex >= session.maxTurns) {
      console.log("\nInterview complete!");
      process.exit(0);
    }

    console.log(`\n🤖 Interviewer: ${session.currentQuestion}`);
    
    rl.question("🗣️  You: ", async (answer) => {
      console.log("⏳ Evaluating...");
      
      const { evaluation, nextQuestion } = await evaluationService.evaluateAndProgress(session, answer);
      
      console.log(`\n💡 [Feedback: Score ${evaluation.score}/5. ${evaluation.feedback}]`);
      
      session.currentQuestion = nextQuestion || undefined;
      session.turnIndex++;
      
      loop();
    });
  };

  loop();
}

run();
