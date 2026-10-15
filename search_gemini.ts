import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not defined in environment.");
    return;
  }
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `Find the Google Maps Place ID for "Suíça Panificadora" located in Marília, SP, Brazil.
Format your output exactly as JSON:
{
  "placeId": "ChI...",
  "businessName": "Official business name",
  "reviewUrl": "https://search.google.com/local/writereview?placeid=ChI..."
}`;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json'
      }
    });
    console.log(response.text);
  } catch (error) {
    console.error("Gemini call failed:", error);
  }
}

run();
