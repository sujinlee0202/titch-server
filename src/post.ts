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

postsRouter.get("/", async (req: any, res: any) => {
  try {
    const post = await prisma.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: {
          select: {
            username: true,
          },
        },
      },
    });
    if (!post) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 오류" });
  }
});

export default postsRouter;
