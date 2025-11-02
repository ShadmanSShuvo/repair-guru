
import { GoogleGenAI, Type } from "@google/genai";
import { JobTicket } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const jobTicketSchema = {
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
      description: "A list of specific parts, materials, or tools needed for the repair.",
      items: {
        type: Type.STRING,
      },
    },
  },
  required: ["problemSummary", "likelyCause", "requiredParts"],
};


export const generateJobTicket = async (
  category: string,
  description: string,
  image: { data: string; mimeType: string } | null
): Promise<JobTicket> => {
    
  const prompt = `You are "Repair Guru", an expert AI diagnostic assistant for home and appliance repair. Your task is to analyze the user's problem description and/or image to create a detailed and precise job ticket for a service technician.

The user has selected the category: "${category}".
The user's description is: "${description}".

Based on this information, diagnose the problem and generate a JSON object with the specified schema. Analyze any provided image for model numbers, signs of wear, leaks, cracks, or any other visual clues. Synthesize all information to provide the most accurate diagnosis possible. If the information is insufficient, make a reasonable and common assumption based on the category.`;

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
        responseSchema: jobTicketSchema
      }
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get a valid response from the AI model.");
  }
};
