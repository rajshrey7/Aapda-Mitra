const { GoogleGenerativeAI } = require("@google/generative-ai");
const { quizPrompt } = require("../systemPrompt/quizPrompt.js");
const dotenv = require("dotenv");
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function generateQuiz(topic, numQuestions) {
    if (!genAI) {
        console.log("Api key is not defined");
        return;
    }

    // Use a model with stronger JSON schema adherence
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

    const targetCount = Number.isFinite(Number(numQuestions)) && Number(numQuestions) > 0 ? Number(numQuestions) : 5;

    const itemSchema = {
        type: "OBJECT",
        properties: {
            question: { type: "STRING" },
            options: {
                type: "ARRAY",
                minItems: 4,
                maxItems: 4,
                items: { type: "STRING" }
            },
            correctAnswer: { type: "STRING" },
            explanation: { type: "STRING" }
        },
        required: ["question", "options", "correctAnswer", "explanation"]
    };

    // We'll request batches and accumulate until we reach targetCount
    const collected = [];
    const seenQuestions = new Set();

    let attempts = 0;
    const maxAttempts = 5; // allow multiple retries/batches

    while (collected.length < targetCount && attempts < maxAttempts) {
        const remaining = targetCount - collected.length;

        const schema = {
            type: "ARRAY",
            minItems: remaining,
            maxItems: remaining,
            items: itemSchema
        };

        const prompt = `
${quizPrompt}

Return only a pure JSON array (no markdown) with exactly ${remaining} items.
Each item must have 4 options, one correctAnswer matching one of those options, and a brief explanation.
Do not copy the example length; strictly output ${remaining} items.
Focus strictly on the topic: ${topic}.
`;

        try {
            const result = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: {
                    responseMimeType: "application/json",
                    responseSchema: schema,
                    temperature: 0.6
                }
            });

            const response = await result.response;
            const text = response.text();
            const batch = JSON.parse(text);

            if (Array.isArray(batch)) {
                for (const q of batch) {
                    if (!q || !q.question || !Array.isArray(q.options) || q.options.length !== 4 || typeof q.correctAnswer !== 'string') continue;
                    if (!q.options.includes(q.correctAnswer)) continue;
                    const normalized = q.question.trim();
                    if (seenQuestions.has(normalized)) continue;
                    seenQuestions.add(normalized);
                    collected.push({
                        question: q.question,
                        options: q.options,
                        correctAnswer: q.correctAnswer,
                        explanation: q.explanation
                    });
                    if (collected.length === targetCount) break;
                }
            }
        } catch (error) {
            console.error("Error generating quiz batch:", error?.message || error);
        }

        attempts++;
    }

    // If we still fell short, make one last attempt without strict schema and parse defensively
    if (collected.length < targetCount) {
        try {
            const fallbackPrompt = `
${quizPrompt}

Generate at least ${targetCount - collected.length} additional MCQs strictly as a JSON array, no markdown.
Ensure 4 options and correctAnswer present in options. Topic: ${topic}.
`;
            const fallbackModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await fallbackModel.generateContent(fallbackPrompt);
            const text = result.response.text();
            const jsonText = text.replace(/```json/gi, "").replace(/```/g, "");
            const batch = JSON.parse(jsonText);
            if (Array.isArray(batch)) {
                for (const q of batch) {
                    if (!q || !q.question || !Array.isArray(q.options) || q.options.length !== 4 || typeof q.correctAnswer !== 'string') continue;
                    if (!q.options.includes(q.correctAnswer)) continue;
                    const normalized = q.question.trim();
                    if (seenQuestions.has(normalized)) continue;
                    seenQuestions.add(normalized);
                    collected.push({
                        question: q.question,
                        options: q.options,
                        correctAnswer: q.correctAnswer,
                        explanation: q.explanation
                    });
                    if (collected.length === targetCount) break;
                }
            }
        } catch (e) {
            console.error("Fallback generation failed:", e?.message || e);
        }
    }

    // Finally, ensure we return exactly targetCount (trim if somehow exceeded)
    return collected.slice(0, targetCount);
}

module.exports = { generateQuiz };