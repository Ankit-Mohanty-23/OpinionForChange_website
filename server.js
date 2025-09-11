import express from "express";
import dotenv from "dotenv";
import connectdb from "./database/db.js";
import LoginRouter from "./routes/userRoutes.js"
import postRouter from "./routes/postRoutes.js"

dotenv.config();

const app = express();
app.use(express.json());

app.use('/user', LoginRouter);
app.use('/post', postRouter);

const PORT = process.env.PORT;
app.listen(PORT, async () => {
    console.log(`Loading Server ...`);
    await connectdb();
    console.log(`Server is running at ${PORT} Port`);
});
