import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { isAuthenticated } from "../middlewares/isAuthenticated";

const postsRouter: Router = Router();
const prisma: PrismaClient = new PrismaClient();

//呟き投稿用API
postsRouter.post("/post", isAuthenticated, async (req: Request, res: Response) => {
    const { content, userId }: {content: string, userId: number} = req.body;

    if (!content) {
        return res.status(400).json({ message: "投稿内容がありません。" });
    };

    try {
        const newPost = await prisma.post.create({
            data: {
                content: content,
                authorId: userId,
            },
            include: {
                author: {
                    include: {
                        profile: true
                    }
                }
            },
        });

        return res.status(201).json(newPost);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "サーバーエラーです。（呟き投稿用API）" });
    };
});

//最新呟き取得用API
postsRouter.get("/get_latest_post", async (req, res) => {

    try {
        const latestPosts =  await prisma.post.findMany({
            take: 10, 
            orderBy: { createdAt: "desc" },
            include: {
                author: {
                    include: {
                        profile: true
                    }
                },
            },
        });
        return res.json(latestPosts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "サーバーエラーです。（最新呟き取得用API）" });
    }
});

//閲覧しているユーザーの投稿内容だけを取得
postsRouter.get("/:userId", async (req: Request, res: Response) => {
    const { userId } = req.params;


    try {
        const userPosts = await prisma.post.findMany({
            where: {
                authorId: parseInt(userId)
            },
            orderBy: {
                createdAt: "desc",
            },
            include: {
                author: true
            },
        });

        return res.status(200).json(userPosts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "サーバーエラーです。（閲覧しているユーザーの投稿内容だけを取得）" });
    };
});

export default postsRouter;