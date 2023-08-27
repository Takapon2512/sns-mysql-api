import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { compare, hash } from "bcrypt";
import { sign } from "jsonwebtoken";

//utils
import { generateIdenticon } from "../utils/generateIdenticon";

const authRouter: Router = Router();
const prisma: PrismaClient = new PrismaClient();

//types
interface LoginType {
    email: string,
    password: string
}

interface NewUserType extends LoginType {
    username: string
}

interface UserInfoType extends LoginType {
    id: number,
    username: string
}

interface ProfileType {
    id: number,
    bio: string,
    profileImageUrl: string
}

//新規ユーザー登録API
authRouter.post("/register", async (req: Request, res: Response) => {
    const { username, email, password }: NewUserType = req.body;

    const hashedPassword: string = await hash(password, 10);

    const user: NewUserType = await prisma.user.create({
        data: {
            username: username,
            email: email,
            password: hashedPassword,
            profile: {
                create: {
                    bio: "はじめまして",
                    profileImageUrl: "sample.png"
                }
            }
        },
        include: {
            profile: true
        }
    });

    return res.json({ user });
});

//ユーザーログインAPI
authRouter.post("/login", async (req, res) => {
    const { email, password }: LoginType = req.body;

    const user: UserInfoType | null = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        return res
            .status(401)
            .json({ error: "メールアドレスかパスワードが間違っています。" });
    };

    const isPasswordVaild: boolean = await compare(password, user.password);
    if (!isPasswordVaild) {
        return res.status(401).json({ error: "そのパスワードは間違っています" });
    };

    const token: string = sign({ id: user.id }, process.env.SECRET_KEY || "", {
        expiresIn: "1d"
    });

    return res.json({ token });
});

export default authRouter;