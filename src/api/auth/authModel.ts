import { PrismaClient } from "@prisma/client";
import { comparePassword } from "../../utils/hash";

const prisma = new PrismaClient();
import type { Users } from "@prisma/client";
import getUserInfo from "../../utils/userUtils";

const authenticate = async (email: string, password: string): Promise<Users | null> => {
    const user = await getUserInfo(email, true, false);

    if (!user || !await comparePassword(password, user.password)) return null;

    return user;
}

export { authenticate };