import express from "express";
import { generateQuiz } from "./services/quiz.services.js";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();

const port = 8081;

const app = express();

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.json({ msg: "ping!!" });
})

app.get("/quiz", async (req, res) => {
    console.log("req recived");
    const { topic, numberOfQuestions } = req.body;
    const questions = await generateQuiz("sunami", 7);
    console.log(questions);
    res.json({ msg: "questions generated", questions });
})

app.listen(port, () => {
    console.log(`---- Server is running on port ${port}`)
})