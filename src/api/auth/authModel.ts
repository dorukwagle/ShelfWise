import { Sessions } from "@prisma/client";
import { comparePassword } from "../../utils/hash";
import { v7 as uuidV7 } from "uuid";
import type { Users } from "@prisma/client";
import getUserInfo from "../../utils/userUtils";
import prismaClient from "../../utils/prismaClient";


interface CustomUser extends Omit<Users, 'password'> {
    password?: string;
}

const authenticate = async (email: string, password: string): Promise<CustomUser | null> => {
    const user = await getUserInfo(email, true, false) as CustomUser;
    if (!user) return null;

    // check if the account is active
    if (user.accountStatus !== "Active") return null;

    if (!await comparePassword(password, (user.password || ''))) return null;
    delete user.password;
    return user;
}

const createSession = async (user: Users): Promise<string> => {
    const userInfo = await getUserInfo(user.userId, false, true);
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 5); // 5 days validity

    const session = await  prismaClient.sessions.create({
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
    await prismaClient.sessions.delete({
        where: {
            sessionId: session.sessionId
        }
    })
    return true;
}

const destroyAllSessions = async (session: Sessions) => {
    await prismaClient.sessions.deleteMany({
        where: {
            userId: session.userId
        }
    });
    return true;
}

export { authenticate, createSession, destroySession};