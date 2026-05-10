import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function ask(prompt: string, system?: string): Promise<string> {
  const fullPrompt = system ? `${system}\n\n${prompt}` : prompt;
  
  // List of models to try in order of preference (using models available on your specific key)
  const models = ['gemini-flash-latest', 'gemini-2.5-flash', 'gemini-3.1-flash-lite'];
  let lastError = null;

  for (const modelName of models) {
    try {
      console.log(`AGENT: Attempting to use model ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(fullPrompt);
      return result.response.text();
    } catch (error: any) {
      lastError = error;
      const errorMsg = error.message?.toLowerCase() || '';
      if (errorMsg.includes('404') || errorMsg.includes('not found') || errorMsg.includes('not supported')) {
        console.warn(`AGENT: Model ${modelName} not available. Trying next...`);
        continue;
      }
      throw error; 
    }
  }

  throw lastError || new Error('All Gemini models failed to respond.');
}
