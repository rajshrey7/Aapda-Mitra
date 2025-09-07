import express from "express";
import dotenv from "dotenv";
import quizRouter from "./routes/quize.routes.js";
dotenv.config();

const port = 8080;

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({ msg: "ping!!" });
})

app.use("/quiz", quizRouter);

app.listen(port, () => {
    console.log(`---- Server is running on port ${port}`)
})