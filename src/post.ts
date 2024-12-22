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
        likes: true,
        _count: {
          select: { likes: true },
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

// post id 로 post 불러오기
postsRouter.get("/:id", async (req: any, res: any) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        author: {
          select: {
            username: true,
          },
        },
        likes: true,
        _count: {
          select: { likes: true },
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

postsRouter.post("/likes", async (req, res: any) => {
  const { userId, postId } = req.body;
  console.log(userId, postId);
  try {
    const like = await prisma.like.create({
      data: {
        userId: userId,
        postId: postId,
      },
    });

    res.status(200).json({ like });
  } catch (error) {
    res.status(500).json({ error: "Failed to like post" });
  }
});

postsRouter.delete("/likes", async (req, res: any) => {
  const { userId, postId } = req.body;
  try {
    const like = await prisma.like.deleteMany({
      where: {
        userId: userId,
        postId: postId,
      },
    });

    res.status(200).json({ like });
  } catch (error) {
    res.status(500).json({ error: "Failed to unlike post" });
  }
});

export default postsRouter;
