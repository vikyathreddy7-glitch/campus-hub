
import { GoogleGenAI, Type } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // Correct initialization with named parameter and direct process.env.API_KEY usage
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async analyzeItemImage(base64Image: string) {
    try {
      // Use the correct multi-part content structure as per documentation
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Image.split(',')[1] || base64Image,
                mimeType: 'image/jpeg'
              }
            },
            {
              text: "Describe this item for a campus marketplace or lost-and-found listing. Provide a concise title, category, and a brief 2-sentence description. Format as JSON."
            }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              category: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["title", "category", "description"]
          }
        }
      });

      // Safely access response.text property (not a method)
      const text = response.text;
      if (!text) return null;
      
      return JSON.parse(text);
    } catch (error) {
      console.error("Gemini analysis failed:", error);
      return null;
    }
  }
}

export const geminiService = new GeminiService();
