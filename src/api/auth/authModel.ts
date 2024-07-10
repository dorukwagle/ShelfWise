import {PrismaClient, Sessions} from "@prisma/client";
import { comparePassword } from "../../utils/hash";
import { v7 as uuidV7 } from "uuid";
import type { Users } from "@prisma/client";
import getUserInfo from "../../utils/userUtils";

const prisma = new PrismaClient();

const authenticate = async (email: string, password: string): Promise<Users | null> => {
    const user = await getUserInfo(email, true, false);

    if (!user || !await comparePassword(password, user.password)) return null;

    return user;
}

const createSession = async (user: Users): Promise<string> => {
    const userInfo = await getUserInfo(user.userId, false, true);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 5); // 5 days validity

    const session = await  prisma.sessions.create({
       data: {
           userId: userInfo!.userId,
           session: uuidV7(),
           role: userInfo!.role.role,
           rolePrecedence: userInfo!.role.precedence,
           expiresAt: expiryDate
       }
    });

    return session.session;
}

const destroySession = async (session: Sessions): Promise<boolean> => {
    await prisma.sessions.delete({
        where: {
            sessionId: session.sessionId
        }
    })
    return true;
}

const destroyAllSessions = async (session: Sessions) => {
    await prisma.sessions.deleteMany({
        where: {
            userId: session.userId
        }
    });
    return true;
}

export { authenticate, createSession, destroySession};