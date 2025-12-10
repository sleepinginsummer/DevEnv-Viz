/* 
  AI Service is currently disabled in favor of local regex parsing.
  Uncomment and install @google/genai if you wish to restore AI features.
*/

// import { GoogleGenAI, Type } from "@google/genai";
// import { ToolType, EnvTool, Platform, PipPackage } from "../types";

// const parseGeminiResponse = (text: string): any => {
//   try {
//     const match = text.match(/```json\n([\s\S]*?)\n```/);
//     if (match) {
//       return JSON.parse(match[1]);
//     }
//     return JSON.parse(text);
//   } catch (e) {
//     console.error("Failed to parse Gemini JSON response", e);
//     throw new Error("AI response was not valid JSON.");
//   }
// };

// const getClient = () => {
//   const apiKey = process.env.API_KEY;
//   if (!apiKey) {
//     throw new Error("API Key is missing.");
//   }
//   return new GoogleGenAI({ apiKey });
// }

// export const parseEnvironmentLogs = async (
//   input: string,
//   platform: Platform
// ): Promise<EnvTool[]> => {
//   const ai = getClient();
//   // ... implementation removed
//   return [];
// };

// export const parsePipPackages = async (input: string): Promise<PipPackage[]> => {
//    // ... implementation removed
//    return [];
// }


// export const getAIAdvice = async (tools: EnvTool[], lang: 'en' | 'zh'): Promise<string> => {
//   // ... implementation removed
//   return "AI Advice disabled.";
// };

export {};
