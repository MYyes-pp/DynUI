'use server'
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_API_KEY,
  baseURL: process.env.AI_BASE_URL,
});

const MODEL_NAME = "qwen-max-2025-01-25"

export async function ai_gen(prompt: string,sysPrompt?: string): Promise<string> {
  try {
    const sys_prompt = `你是一个系统架构师，数据库专家，需求分析专家。你毫无保留的回答提出的问题。`;
    console.log("AI THINKING ...")
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: sysPrompt || sys_prompt },
        { role: "user", content: prompt },
      ],
      model: MODEL_NAME,
      temperature: 0.2,
    });
    return completion.choices[0].message.content || "";
  } catch (error) {
    console.error(error);
    return ""
  }
}