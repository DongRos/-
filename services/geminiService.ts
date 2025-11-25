import { GoogleGenAI, Type } from "@google/genai";
import { Vocabulary, GrammarPoint } from "../types";

// Note: In a real production app, move this to a backend proxy.
// For this demo, we assume the environment variable or user input logic if we were building an auth flow.
// However, the prompt instructions say to use process.env.API_KEY.
// If running locally without a bundler that injects this, it might fail, but I must follow instructions.

const getAIClient = () => {
  // Use trim() to handle potential accidental whitespace from environment variables
  const apiKey = process.env.API_KEY ? process.env.API_KEY.trim() : "";
  
  if (!apiKey) {
    console.error("Gemini API Key is missing. Please ensure process.env.API_KEY is correctly set in your environment variables for deployment.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeRawNotes = async (rawText: string): Promise<{ vocab: Vocabulary[], grammar: GrammarPoint[], summary: string } | null> => {
  const client = getAIClient();
  if (!client) return null;

  const prompt = `
    你是一位专业的英语私教，专门辅导中国学生。学生提供了一段视频学习的原始笔记。
    请分析这些笔记并提取以下内容（所有解释必须使用中文）：

    1. 重点词汇 (Key Vocabulary)：提取高级或实用的单词/短语，提供中文定义和英文例句。
    2. 语法知识点 (Grammar Points)：提取句法、时态或结构，用中文清晰解释，并附带例句（可以使用笔记中的原句或通用例句）。
    3. 摘要 (Summary)：用一句话中文总结视频主题。

    学生笔记内容: "${rawText}"
  `;

  try {
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            vocabulary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  definition: { type: Type.STRING, description: "Chinese definition" },
                  example: { type: Type.STRING }
                }
              }
            },
            grammar: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  explanation: { type: Type.STRING, description: "Chinese explanation" },
                  example: { type: Type.STRING }
                }
              }
            },
            summary: { type: Type.STRING, description: "Chinese summary" }
          }
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return {
        vocab: data.vocabulary || [],
        grammar: data.grammar || [],
        summary: data.summary || "暂无摘要"
      };
    }
    return null;
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return null;
  }
};