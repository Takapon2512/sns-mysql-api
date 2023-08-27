import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { isAuthenticated } from "../middlewares/isAuthenticated";

//types
interface LoginType {
    email: string,
    password: string
}

interface UserInfoType extends LoginType {
    id: number,
    username: string
}

interface ProfileType {
    id: number;
    bio: string;
    profileImageUrl: string;
    userId: number;
    user: UserInfoType
}

const usersRouter: Router = Router();
const prisma: PrismaClient = new PrismaClient();

usersRouter.get("/find", isAuthenticated, async (req: Request, res: Response) => {
    try {
        const user: UserInfoType | null = await prisma.user.findUnique({ where: { id: req.body.userId } });

        if (!user) res.status(404).json({ message: "ユーザーが見つかりませんでした。" });

        res.status(200).json({ user: { id: user?.id, email: user?.email, username: user?.username } });

    } catch (err) {
        res.status(500).json({ message: "サーバーエラーです。" });
    }
});

//プロフィール取得用API
usersRouter.get("/profile/:userId", async (req: Request, res: Response) => {
   const { userId } = req.params; 

   try {
    const profile = await prisma.profile.findUnique({
        where: { userId: parseInt(userId) },
        include: {
            user: {
                include: {
                    profile: true
                }
            }
        }
    });

    if (!profile) return res.status(404).json({ message: "プロフィールが見つかりませんでした。" });

    res.status(200).json(profile);

   } catch (err) {
    console.error(err);
    res.status(500).json({ message: "サーバーエラーです。" });
   }
});

export default usersRouter;