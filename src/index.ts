import express, { Router } from "express";
import morgan from "morgan";
import cors from "cors";
import usersRouter from "./users";
import authRouter from "./auth";
import cookieParser from "cookie-parser";

const app = express();
const router = Router();

app.use(cookieParser());
app.use(express.json());
app.use(morgan("dev"));
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

// 회원가입
router.use("/api/users", usersRouter);

// 로그인, 인증
router.use("/api/auth", authRouter);

app.use(router);

app.get("/", (_, res) => {
  res.send("running");
});

let port = 8080;

app.listen(port, async () => {
  console.log(`server running at http://localhost:${port}`);
});
