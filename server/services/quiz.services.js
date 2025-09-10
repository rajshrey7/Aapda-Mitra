import { GoogleGenerativeAI } from "@google/generative-ai";
import { quizPrompt } from "../systemPrompt/quizPrompt.js";
import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export async function generateQuiz(topic, numQuestions) {
    if(!genAI) {    
        console.log("Api key is not defined");
        return;
    }

    console.log(apiKey);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
    ${quizPrompt}

    Now, based on these instructions, please generate ${15} MCQs on the topic of ${topic}.
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonText = text.replace(/```json/g, "").replace(/```/g, "");

        const quiz = JSON.parse(jsonText);
        return quiz;
    } catch (error) {
        console.error("Error generating quiz:", error);
        throw new Error("Failed to generate quiz from LLM");
    }
}