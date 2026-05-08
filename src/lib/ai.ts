import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

export function getAI() {
  if (!ai) {
    // The environment will automatically inject process.env.GEMINI_API_KEY
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not defined.");
    }
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

export async function summarizeText(text: string): Promise<string> {
  if (!text.trim()) return "No content to summarize.";
  
  try {
    const aiClient = getAI();
    const response = await aiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: `Provide a very concise, one-sentence synthesized summary of the following phenomenological/philosophical text:\n\n${text.substring(0, 3000)}` }]
        }
      ]
    });
    
    if (response.text) {
      return response.text;
    }
    return "Could not generate summary.";
  } catch (error) {
    console.error("AI Summarize error:", error);
    // Fallback to basic text slicing if API fails
    const words = text.split(' ').slice(0, 15).join(' ');
    return `Synthesized essence: ${words}...`;
  }
}
