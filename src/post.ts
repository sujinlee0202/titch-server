import { PrismaClient } from "@prisma/client";
import { Router } from "express";

const postsRouter = Router();
const prisma = new PrismaClient();

postsRouter.post("/create", async (req, res) => {
  console.log("create");
  console.log("req", req);
  try {
    const post = await prisma.post.create({ data: { ...req.body } });
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: "Failed to create post" });
  }
});

export default postsRouter;
