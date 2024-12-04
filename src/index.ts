import express, { Router } from "express";
import morgan from "morgan";
import cors from "cors";
import usersRouter from "./users";

const app = express();
const router = Router();

app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

// 회원가입
router.use("/api/users", usersRouter);

app.use(router);

app.get("/", (_, res) => {
  res.send("running");
});

let port = 8080;

app.listen(port, async () => {
  console.log(`server running at http://localhost:${port}`);
});
