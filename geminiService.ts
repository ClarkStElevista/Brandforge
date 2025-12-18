
import { GoogleGenAI, Type, GenerateContentResponse, Chat } from "@google/genai";
import { BrandBible, ImageSize } from "./types";

// Note: process.env.API_KEY is handled externally.
// We create the AI instance within the functions to ensure the latest selected key is used
// as per the Gemini API guidance for image generation models.

export const generateBrandStrategy = async (mission: string, brandName: string): Promise<BrandBible> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Generate a comprehensive brand strategy for a company named "${brandName}" based on this mission: "${mission}". Output as JSON. Ensure you provide exactly 3 distinct Google Font pairings that reflect the brand voice.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          brandName: { type: Type.STRING },
          tagline: { type: Type.STRING },
          missionStatement: { type: Type.STRING },
          brandVoice: { type: Type.STRING },
          palette: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                hex: { type: Type.STRING },
                name: { type: Type.STRING },
                usage: { type: Type.STRING },
              },
              required: ["hex", "name", "usage"]
            }
          },
          fontPairings: {
            type: Type.ARRAY,
            description: "Three distinct Google Font pairings (Header + Body) suitable for this brand",
            items: {
              type: Type.OBJECT,
              properties: {
                header: { type: Type.STRING, description: "A Google Font name for headers" },
                body: { type: Type.STRING, description: "A Google Font name for body text" },
                description: { type: Type.STRING, description: "Why this pairing works for the brand" }
              },
              required: ["header", "body", "description"]
            }
          }
        },
        required: ["brandName", "tagline", "missionStatement", "brandVoice", "palette", "fontPairings"]
      }
    }
  });

  return JSON.parse(response.text) as BrandBible;
};

export const generateBrandImage = async (
  prompt: string, 
  size: ImageSize = ImageSize.S1K
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: size as any, // Cast as it matches 1K, 2K, 4K strings
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("No image was generated");
};

export const createBrandChat = (brandDetails?: BrandBible): Chat => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const context = brandDetails 
    ? `You are a branding expert helping the user with their brand: ${brandDetails.brandName}. 
       Tagline: ${brandDetails.tagline}. 
       Mission: ${brandDetails.missionStatement}. 
       Voice: ${brandDetails.brandVoice}.`
    : "You are a world-class branding consultant.";

  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: context,
    },
  });
};
