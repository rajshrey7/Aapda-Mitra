import { Router } from "express";
import { generateQuiz } from "../services/quiz.services.js";

const quizRouter = Router();

quizRouter.get("/", async (req, res) => {
    const { topic, numQuestions } = req.query;
    if (!topic || !numQuestions) {
        return res.status(400).json({ msg: "Both topic and numQuestions are required query parameters." });
    }
    try {
        const questions = await generateQuiz(topic, parseInt(numQuestions, 10));
        res.json({ msg: "questions generated", questions });
    } catch (error) {
        res.status(500).json({ msg: "Error generating quiz", error: error.message });
    }
});

export default quizRouter;