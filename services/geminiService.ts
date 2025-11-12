import { GoogleGenAI, Type } from "@google/genai";
import { AiDiagnosis } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const diagnosisSchema = {
  type: Type.OBJECT,
  properties: {
    problemSummary: {
      type: Type.STRING,
      description: "A concise, one-sentence summary of the issue.",
    },
    likelyCause: {
      type: Type.STRING,
      description: "A detailed explanation of the probable root cause of the problem, written for a technician.",
    },
    requiredParts: {
      type: Type.ARRAY,
      description: "A list of specific parts, materials, or tools needed for the repair. For each part, provide an estimated price in BDT.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: {
            type: Type.STRING,
            description: "The name of the required part or tool."
          },
          estimatedPrice: {
            type: Type.NUMBER,
            description: "The estimated price of the part in BDT (Bangladeshi Taka). Example: 2550.50"
          }
        },
        required: ["name", "estimatedPrice"]
      },
    },
    estimatedLaborHours: {
      type: Type.NUMBER,
      description: "An estimate of the number of hours a qualified technician would need to complete the repair. Can be a fraction, e.g., 1.5."
    }
  },
  required: ["problemSummary", "likelyCause", "requiredParts", "estimatedLaborHours"],
};

const getApiErrorKey = (error: unknown): string => {
    if (error instanceof Error) {
        const message = error.message.toLowerCase();
        if (message.includes('api key not valid')) return 'error_api_key_invalid';
        if (message.includes('resource_exhausted') || message.includes('429')) return 'error_api_rate_limit';
        if (message.includes('safety')) return 'error_api_safety_block';
        if (message.includes('500') || message.includes('internal') || message.includes('unavailable')) return 'error_api_server_error';
    }
    return 'error_api_generic';
};


export const generateJobTicket = async (
  category: string,
  description: string,
  image: { data: string; mimeType: string } | null,
  language: 'en' | 'bn'
): Promise<AiDiagnosis> => {
    
  const languageInstruction = language === 'bn' 
    ? "Please provide the entire JSON response, including all text fields like problemSummary, likelyCause, and part names, in the Bengali (Bangla) language."
    : "Please provide the entire JSON response in English.";

  const prompt = `You are "Repair Guru", an expert AI diagnostic assistant for home and appliance repair. Your task is to analyze the user's problem description and/or image to create a detailed and precise job ticket for a service technician.

The user has selected the category: "${category}".
The user's description is: "${description}".

${languageInstruction}

Based on this information, diagnose the problem and generate a JSON object with the specified schema. This includes estimating the cost of required parts (in BDT) and the labor hours needed. Analyze any provided image for model numbers, signs of wear, leaks, cracks, or any other visual clues. Synthesize all information to provide the most accurate diagnosis possible. If the information is insufficient, make a reasonable and common assumption based on the category.`;

  const imagePart = image ? {
    inlineData: {
      data: image.data,
      mimeType: image.mimeType,
    },
  } : null;
  
  const textPart = {
      text: prompt,
  };

  const parts = imagePart ? [textPart, imagePart] : [textPart];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: diagnosisSchema
      }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    const errorKey = getApiErrorKey(error);
    throw new Error(errorKey);
  }
};