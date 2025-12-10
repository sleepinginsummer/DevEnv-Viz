import { GoogleGenAI, Type } from "@google/genai";
import { ToolType, EnvTool, Platform, PipPackage } from "../types";

const parseGeminiResponse = (text: string): any => {
  try {
    const match = text.match(/```json\n([\s\S]*?)\n```/);
    if (match) {
      return JSON.parse(match[1]);
    }
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse Gemini JSON response", e);
    throw new Error("AI response was not valid JSON.");
  }
};

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }
  return new GoogleGenAI({ apiKey });
}

export const parseEnvironmentLogs = async (
  input: string,
  platform: Platform
): Promise<EnvTool[]> => {
  const ai = getClient();

  const prompt = `
    You are a strictly structured DevOpts parser. 
    I will provide you with terminal output, config file content, or a list of paths from a ${platform} machine.
    
    Your goal is to extract installed development environments (Java/JDK, Python, Go, Node.js).
    
    Input Data:
    """
    ${input}
    """

    Rules:
    1. Identify the tool type (JAVA, PYTHON, GO, NODE).
    2. Extract the specific version number.
    3. Extract the path if available (if not, use "Unknown Path").
    4. Guess if it is likely the system default based on cues (like '*' in output or 'system' keyword), otherwise false.
    5. Identify the source (e.g., Brew, Pyenv, NVM, SDKMan, System) based on the path structure.
    6. Generate a unique ID for each.
    7. Return valid JSON only.

    Response Schema is an array of objects.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING, description: "Display name e.g. OpenJDK 17" },
              type: { type: Type.STRING, enum: ["JAVA", "PYTHON", "GO", "NODE", "UNKNOWN"] },
              version: { type: Type.STRING },
              path: { type: Type.STRING },
              isSystemDefault: { type: Type.BOOLEAN },
              source: { type: Type.STRING }
            },
            required: ["id", "name", "type", "version", "path", "isSystemDefault", "source"]
          }
        }
      }
    });

    const rawData = response.text;
    if (!rawData) return [];

    const parsed = parseGeminiResponse(rawData);
    
    return parsed.map((item: any) => ({
      ...item,
      detectedAt: new Date().toISOString()
    }));

  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};

export const parsePipPackages = async (input: string): Promise<PipPackage[]> => {
  const ai = getClient();

  const prompt = `
    Analyze this 'pip list' output:
    """
    ${input}
    """
    
    Return a JSON array of packages. 
    For each package, determine 'isBuiltIn' (boolean). 
    Set 'isBuiltIn' to true ONLY if it is a core Python standard library (like os, sys, re - usually not in pip list) or a critical packaging tool (pip, setuptools, wheel). 
    Most user installed packages should be false.
  `;

  try {
     const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              version: { type: Type.STRING },
              isBuiltIn: { type: Type.BOOLEAN },
            },
            required: ["name", "version", "isBuiltIn"]
          }
        }
      }
    });
    
    const rawData = response.text;
    if (!rawData) return [];
    return parseGeminiResponse(rawData);

  } catch (error) {
    console.error("Gemini Pip Parse Error:", error);
    return [];
  }
}


export const getAIAdvice = async (tools: EnvTool[], lang: 'en' | 'zh'): Promise<string> => {
  const ai = getClient();
  
  const summary = tools.map(t => `${t.type}: ${t.version} (${t.source})`).join('\n');

  const prompt = `
    Analyze this user's development environment inventory:
    ${summary}

    Provide 3 short, bulleted actionable tips regarding version compatibility, security risks, or management best practices.
    
    Respond in ${lang === 'zh' ? 'Chinese (Simplified)' : 'English'}.
    Keep it friendly and concise.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text || "No advice generated.";
  } catch (error) {
    return "Could not generate advice at this time.";
  }
};