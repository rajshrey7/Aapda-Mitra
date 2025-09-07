import express from "express";
import { generateQuiz } from "./services/quiz.services.js";
import dotenv from "dotenv";
dotenv.config();

const port = 8080;

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({ msg: "ping!!" });
})

app.get("/quiz", async (req, res) => {
    const questions = await generateQuiz("sunami", 7);
    console.log(questions);
    res.json({ msg: "questions generated" });
})

app.listen(port, () => {
    console.log(`---- Server is running on port ${port}`)
})