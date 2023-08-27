import express, { Application } from "express";
import "dotenv/config";
import cors from "cors";

import authRouter from "./routers/auth";
import postsRouter from "./routers/posts";
import usersRouter from "./routers/user";

const app: Application = express();

const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/posts", postsRouter);
app.use("/api/users", usersRouter);

app.listen(PORT, () => console.log(`server is running on Port ${PORT}`));
