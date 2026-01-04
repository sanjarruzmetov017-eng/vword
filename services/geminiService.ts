
import { GoogleGenAI, Type } from "@google/genai";

function parseSafeJson(text: string) {
  try {
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
    const targetJson = jsonMatch ? jsonMatch[0] : cleanText;
    return JSON.parse(targetJson);
  } catch (e) {
    console.error("JSON parsing xatosi:", e, text);
    throw new Error("AI javobi noto'g'ri formatda");
  }
}

export async function validateWord(word: string, lastLetter: string | null): Promise<{ isValid: boolean; meaning?: string; error?: string }> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const prompt = `Word: "${word.toUpperCase()}". Must start with: "${lastLetter || 'any'}". 
    Task: Strictly check if this word exists in the standard ENGLISH dictionary. 
    Accept common nouns, verbs, adjectives, and proper nouns in English.
    Return response ONLY in this JSON format: {"isValid": boolean, "meaning": "short English definition", "error": "reason if invalid in English"}`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValid: { type: Type.BOOLEAN },
            meaning: { type: Type.STRING },
            error: { type: Type.STRING }
          },
          required: ["isValid"]
        }
      }
    });
    
    const result = parseSafeJson(response.text);
    
    if (lastLetter && word.toLowerCase()[0] !== lastLetter.toLowerCase()) {
      return { isValid: false, error: `'${lastLetter.toUpperCase()}' harfi bilan boshlanishi shart!` };
    }
    
    return result;
  } catch (error) {
    console.error("Validation error:", error);
    return { isValid: word.length >= 3, meaning: "English word (Validation bypassed)." };
  }
}

export async function getBotMove(lastLetter: string, difficulty: 'easy' | 'medium' | 'hard'): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Strict CEFR rules to ensure the bot doesn't match the user's complexity
  const cefrMapping = {
    easy: {
      levels: "STRICTLY A1 or A2 (Beginner)",
      description: "Use ONLY basic, everyday words (e.g., 'apple', 'book', 'house').",
      forbidden: "Do NOT use any words from B1, B2, C1, or C2 levels. Avoid complex or academic vocabulary."
    },
    medium: {
      levels: "STRICTLY B1 or B2 (Intermediate)",
      description: "Use common but slightly more descriptive words (e.g., 'available', 'experience', 'quality').",
      forbidden: "Do NOT use very simple A1 words like 'cat' or 'dog', and do NOT use very complex C1/C2 words."
    },
    hard: {
      levels: "STRICTLY C1 or C2 (Advanced/Proficiency)",
      description: "Use sophisticated, academic, rare, or complex vocabulary (e.g., 'equivocal', 'idiosyncrasy', 'ubiquitous').",
      forbidden: "ABSOLUTELY FORBIDDEN to use simple words like 'happy', 'big', or 'easy'. Must be high-level English."
    }
  };

  const currentLevel = cefrMapping[difficulty];

  try {
    const prompt = `Act as an English Word Battle opponent. 
    Current Target Letter: "${lastLetter.toUpperCase()}".
    REQUIRED LEVEL: ${currentLevel.levels}.
    GUIDELINE: ${currentLevel.description}
    RESTRICTION: ${currentLevel.forbidden}
    Your response must be independent of what the user has written. You only follow the ${difficulty} setting.
    Length: 3-15 letters.
    Return response ONLY in this JSON format: {"word": "the_word"}`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: { word: { type: Type.STRING } },
          required: ["word"]
        }
      }
    });
    
    const data = parseSafeJson(response.text);
    return data.word.toLowerCase().trim();
  } catch (error) {
    console.error("Bot move error:", error);
    // Hardcoded fallback for reliability
    const fallbacks = {
      easy: { 'a': 'apple', 'b': 'banana', 'c': 'car' },
      medium: { 'a': 'adventure', 'b': 'balance', 'c': 'comfort' },
      hard: { 'a': 'altruistic', 'b': 'belligerent', 'c': 'circumlocution' }
    };
    const letter = lastLetter.toLowerCase();
    return (fallbacks[difficulty] as any)[letter] || (difficulty === 'hard' ? "abnegation" : "ant");
  }
}
