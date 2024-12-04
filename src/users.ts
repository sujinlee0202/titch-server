import { PrismaClient } from "@prisma/client";
import { Router } from "express";

const usersRouter = Router();
const prisma = new PrismaClient();

usersRouter.post("/", async (req, res) => {
  try {
    const user = await prisma.user.create({ data: { ...req.body } });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" });
  }
});

export default usersRouter;
