import { OpenAIClient } from '../assistants/client.js';
import { saveQA } from '../repositories/qa.js';

type AskInput = {
  question: string;
  context?: { year?: number; courseCode?: string };
};

export async function askService(input: AskInput) {
  // Delegate to OpenAI Assistants (stubbed for now)
  const ai = new OpenAIClient();
  const { answerMd, citations } = await ai.askWithCitations(input);

  const saved = await saveQA({
    question: input.question,
    answerMd,
    year: input.context?.year,
    courseCode: input.context?.courseCode,
    citations,
  });

  return { answerMd, citations, qaId: saved.id };
}
